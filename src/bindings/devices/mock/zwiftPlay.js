import EventEmitter from 'events'

// Mock Zwift Play: the two halves of a Zwift Play controller as BLE peripherals, presented the
// way the Linux WebBLE binding (desktop: features/webble/ipc-binding.js) presents real ones:
// - both halves advertise as "Zwift Play", the id is the MAC, there is no manufacturer data
// - every discovery hands out new peripheral/characteristic wrappers for the same physical
//   device, and a notification reaches every wrapper subscribed to that characteristic
// - pairing: "RideOn" written to the control characteristic is answered with "RideOn" on the
//   response characteristic; buttons are PlayKeyPadStatus (0x07) notifications, sent on press
//   and on release, plus an idle (0x19) message every few seconds
//
// So the whole controller path - devices page, pairing, companion half, key navigation - can be
// exercised without the hardware. Enabled with `?mock=zwift-play` in the page URL (desktop:
// `npm run dev:local -- --mock-zwift-play`), driven via window.mockZwiftPlay (console / CDP):
//   mockZwiftPlay.press('dpad-down')        one click (press + release)
//   mockZwiftPlay.press('pad-a', 600)       a long press
//   mockZwiftPlay.powerOff('right') / powerOn('right')
//   mockZwiftPlay.status()                  connections, subscriptions, writes

export const PLAY_SERVICE = '00000001-19ca-4651-86e5-fa29dcdd09d1'
export const MEASUREMENT = '00000002-19ca-4651-86e5-fa29dcdd09d1'
export const CONTROL = '00000003-19ca-4651-86e5-fa29dcdd09d1'
export const RESPONSE = '00000004-19ca-4651-86e5-fa29dcdd09d1'

const CHARACTERISTICS = [
    { uuid: MEASUREMENT, properties: ['notify'] },
    { uuid: CONTROL, properties: ['writeWithoutResponse', 'write'] },
    { uuid: RESPONSE, properties: ['indicate'] },
]

// PlayKeyPadStatus field numbers. Values: 0 = ON (pressed / right pad), 1 = OFF
const FIELD = { rightPad: 1, yUp: 2, zLeft: 3, aRight: 4, bDown: 5, shiftButton: 6, logo: 7, analogLR: 8, analogUD: 9 }
const BUTTON_FIELDS = [FIELD.yUp, FIELD.zLeft, FIELD.aRight, FIELD.bDown, FIELD.shiftButton, FIELD.logo]

// key name (as emitted by incyclist-devices) -> [half, PlayKeyPadStatus field]
export const KEYS = {
    'dpad-up':    ['left', FIELD.yUp],
    'dpad-left':  ['left', FIELD.zLeft],
    'dpad-right': ['left', FIELD.aRight],
    'dpad-down':  ['left', FIELD.bDown],
    'down':       ['left', FIELD.shiftButton],
    'l-power':    ['left', FIELD.logo],
    'pad-y':      ['right', FIELD.yUp],
    'pad-z':      ['right', FIELD.zLeft],
    'pad-a':      ['right', FIELD.aRight],
    'pad-b':      ['right', FIELD.bDown],
    'up':         ['right', FIELD.shiftButton],
    'r-power':    ['right', FIELD.logo],
}

export const ADDRESSES = { left: 'F0:5A:11:00:00:01', right: 'F0:5A:11:00:00:02' }

const CLICK_DURATION = 80
const IDLE_INTERVAL = 5000
const CONNECT_DELAY = 50

// one varint-encoded field (all values used here are < 128)
const field = (no, value) => [no << 3, value]

/** PlayKeyPadStatus notification of one half, with `pressed` (a field number) held down */
export const encodeKeyPadStatus = (side, pressed) => {
    const bytes = [0x07, ...field(FIELD.rightPad, side === 'right' ? 0 : 1)]
    BUTTON_FIELDS.forEach(f => bytes.push(...field(f, f === pressed ? 0 : 1)))
    bytes.push(...field(FIELD.analogLR, 0), ...field(FIELD.analogUD, 0))
    return Buffer.from(bytes)
}

const IDLE_MESSAGE = Buffer.from([0x19, 0x10, 0x01])

// UUIDs come in any form (short, dashless, dashed, any case) - compare their 128 bit form
const fullUUID = (uuid) => {
    let u = String(uuid).toLowerCase().replace(/^0x/, '').replace(/-/g, '')
    if (u.length === 4) u = `0000${u}`
    if (u.length === 8) u = `${u}00001000800000805f9b34fb`
    return u
}
const sameUUID = (a, b) => fullUUID(a) === fullUUID(b)
const wanted = (list, uuid) => !list?.length || list.some(u => sameUUID(u, uuid))

const sleep = (ms) => new Promise(done => setTimeout(done, ms))

// one physical half of the controller
class MockPlayHalf {
    constructor(side, address) {
        this.side = side
        this.address = address
        this.name = 'Zwift Play'
        this.poweredOn = true
        this.connections = new Set()      // connected peripheral wrappers
        this.subscribers = new Map()      // characteristic uuid -> Set of characteristic wrappers
        this.writes = []
        this.idleTimer = null
    }

    connect(peripheral) {
        this.connections.add(peripheral)
        if (!this.idleTimer)
            this.idleTimer = setInterval(() => this.notify(MEASUREMENT, IDLE_MESSAGE), IDLE_INTERVAL)
    }

    release(peripheral) {
        this.connections.delete(peripheral)
        this.subscribers.forEach(wrappers => wrappers.forEach(w => { if (w._peripheral === peripheral) wrappers.delete(w) }))
        if (this.connections.size === 0)
            this.stopIdle()
    }

    stopIdle() {
        clearInterval(this.idleTimer)
        this.idleTimer = null
    }

    subscribe(char) {
        if (!this.subscribers.has(char.uuid))
            this.subscribers.set(char.uuid, new Set())
        this.subscribers.get(char.uuid).add(char)
    }

    unsubscribe(char) {
        this.subscribers.get(char.uuid)?.delete(char)
    }

    notify(uuid, data) {
        const wrappers = this.subscribers.get(uuid)
        if (!this.poweredOn || !wrappers)
            return 0
        wrappers.forEach(w => w.emit('data', Buffer.from(data), true))
        return wrappers.size
    }

    write(uuid, data) {
        this.writes.push({ uuid, data: data.toString('hex'), ts: Date.now() })
        if (this.writes.length > 50)
            this.writes.shift()
        if (sameUUID(uuid, CONTROL) && data.subarray(0, 6).toString() === 'RideOn')
            setTimeout(() => this.notify(RESPONSE, Buffer.from('RideOn')), 20)
    }

    async press(fieldNo, duration) {
        const delivered = this.notify(MEASUREMENT, encodeKeyPadStatus(this.side, fieldNo))
        await sleep(duration)
        this.notify(MEASUREMENT, encodeKeyPadStatus(this.side, undefined))
        return delivered
    }

    powerOff() {
        this.poweredOn = false
        this.stopIdle()
        const connections = [...this.connections]
        this.connections.clear()
        this.subscribers.clear()
        connections.forEach(p => {
            p.state = 'disconnected'
            p.emit('disconnect')
        })
    }
}

export class MockZwiftPlayBinding extends EventEmitter {
    /**
     * @param inner the real BLE binding (may be null): its devices are announced as well
     */
    constructor(inner) {
        super()
        this.inner = inner ?? null
        this._bindings = this
        this._state = 'unknown'
        this._stateHooked = false
        this.scanning = false
        this.halves = {
            left: new MockPlayHalf('left', ADDRESSES.left),
            right: new MockPlayHalf('right', ADDRESSES.right),
        }
        this.inner?.on('discover', (peripheral) => this.emit('discover', peripheral))
    }

    get state() {
        return this._state
    }

    set state(s) {
        this._state = s
    }

    // like the real bindings: the state is reported once someone listens for it. The mock
    // controller is always reachable, even if the computer's own adapter is off.
    on(event, listener) {
        super.on(event, listener)
        if (event === 'stateChange' && !this._stateHooked) {
            this._stateHooked = true
            const poweredOn = () => {
                this._state = 'poweredOn'
                this.emit('stateChange', 'poweredOn')
            }
            if (this.inner)
                this.inner.on('stateChange', poweredOn)
            else
                setTimeout(poweredOn, 0)
        }
        return this
    }

    pauseLogging() { this.inner?.pauseLogging?.() }
    resumeLogging() { this.inner?.resumeLogging?.() }
    setServerDebug(enabled) { this.inner?.setServerDebug?.(enabled) }
    setSupportedServices(uuids) { this.inner?.setSupportedServices?.(uuids) }

    startScanning(serviceUUIDs, allowDuplicates, callback) {
        this.scanning = true
        if (this.inner)
            this.inner.startScanning(serviceUUIDs, allowDuplicates, callback)
        else
            callback?.(null)

        // like real advertisements, the halves show up a moment after the scan started
        setTimeout(() => this.announceAll(serviceUUIDs), 300)
    }

    stopScanning(callback) {
        this.scanning = false
        if (this.inner)
            this.inner.stopScanning(callback)
        else
            callback?.()
    }

    announceAll(serviceUUIDs) {
        if (!this.scanning)
            return
        if (serviceUUIDs?.length && !serviceUUIDs.some(u => sameUUID(u, PLAY_SERVICE)))
            return
        Object.values(this.halves).forEach(half => this.announce(half))
    }

    announce(half) {
        if (!half.poweredOn || !this.scanning)
            return
        this.emit('discover', this.createPeripheral(half))
    }

    createPeripheral(half) {
        const emitter = new EventEmitter()
        const peripheral = {
            id: half.address,
            uuid: half.address,
            address: half.address,
            name: half.name,
            advertisement: { localName: half.name, serviceUuids: [PLAY_SERVICE] },
            state: 'disconnected',
            services: [],

            on: (ev, cb) => emitter.on(ev, cb),
            off: (ev, cb) => emitter.off(ev, cb),
            once: (ev, cb) => emitter.once(ev, cb),
            removeAllListeners: (ev) => emitter.removeAllListeners(ev),
            emit: (ev, ...args) => emitter.emit(ev, ...args),

            connectAsync: async () => {
                await sleep(CONNECT_DELAY)
                if (!half.poweredOn)
                    throw new Error('GATT connect failed: device not reachable')
                half.connect(peripheral)
                peripheral.state = 'connected'
            },
            disconnect: async (cb) => {
                half.release(peripheral)
                peripheral.state = 'disconnected'
                cb?.()
            },
            disconnectAsync: async () => {
                half.release(peripheral)
                peripheral.state = 'disconnected'
            },
            discoverServicesAsync: async (serviceUUIDs) => (
                wanted(serviceUUIDs, PLAY_SERVICE) ? [{ uuid: PLAY_SERVICE }] : []
            ),
            discoverSomeServicesAndCharacteristicsAsync: async (serviceUUIDs, characteristicUUIDs) => {
                if (!wanted(serviceUUIDs, PLAY_SERVICE) || peripheral.state !== 'connected')
                    return { services: [], characteristics: [] }
                const characteristics = CHARACTERISTICS
                    .filter(c => wanted(characteristicUUIDs, c.uuid))
                    .map(c => this.createCharacteristic(half, peripheral, c))
                return { services: [{ uuid: PLAY_SERVICE }], characteristics }
            },
        }
        return peripheral
    }

    createCharacteristic(half, peripheral, { uuid, properties }) {
        const emitter = new EventEmitter()
        const char = {
            uuid,
            _serviceUuid: PLAY_SERVICE,
            _peripheralId: peripheral.id,
            _peripheral: peripheral,
            properties: [...properties],

            on: (ev, cb) => emitter.on(ev, cb),
            off: (ev, cb) => emitter.off(ev, cb),
            once: (ev, cb) => emitter.once(ev, cb),
            removeAllListeners: (ev) => emitter.removeAllListeners(ev),
            emit: (ev, ...args) => emitter.emit(ev, ...args),

            subscribe: (cb) => {
                if (peripheral.state !== 'connected')
                    return cb?.(new Error('not connected'))
                half.subscribe(char)
                cb?.(null)
            },
            unsubscribe: (cb) => {
                half.unsubscribe(char)
                cb?.(null)
            },
            read: (cb) => cb?.(null, Buffer.alloc(0)),
            write: (data, withoutResponse, cb) => {
                if (peripheral.state !== 'connected') {
                    if (!withoutResponse) cb?.(new Error('not connected'))
                    return
                }
                half.write(uuid, Buffer.isBuffer(data) ? data : Buffer.from(data))
                if (!withoutResponse)
                    cb?.(null)
            },
        }
        return char
    }

    // --- controls (window.mockZwiftPlay) ---

    /** one press and release of `key`; resolves with the number of subscribers that got it */
    async press(key, duration = CLICK_DURATION) {
        const mapping = KEYS[key]
        if (!mapping)
            throw new Error(`unknown key ${key}, known keys: ${Object.keys(KEYS).join(', ')}`)
        const [side, fieldNo] = mapping
        return this.halves[side].press(fieldNo, duration)
    }

    powerOff(side) {
        this.sides(side).forEach(half => half.powerOff())
    }

    powerOn(side) {
        this.sides(side).forEach(half => {
            half.poweredOn = true
            this.announce(half)
        })
    }

    sides(side) {
        return side ? [this.halves[side]] : Object.values(this.halves)
    }

    status() {
        return Object.fromEntries(Object.values(this.halves).map(h => [h.side, {
            address: h.address,
            poweredOn: h.poweredOn,
            connections: h.connections.size,
            subscribers: Object.fromEntries([...h.subscribers.entries()].map(([uuid, set]) => [uuid.slice(4, 8), set.size])),
            writes: h.writes.slice(-5),
        }]))
    }
}

export const isMockZwiftPlayEnabled = () => {
    try {
        return new URLSearchParams(window.location.search).get('mock')?.split(',').includes('zwift-play') ?? false
    }
    catch {
        return false
    }
}

/** wraps the real BLE binding with the mock controller and exposes it as window.mockZwiftPlay */
// the binding factory can be asked more than once - there is only one controller
let instance = null
export const withMockZwiftPlay = (inner) => {
    if (!instance || instance.inner !== (inner ?? null))
        instance = new MockZwiftPlayBinding(inner)
    if (typeof window !== 'undefined')
        window.mockZwiftPlay = instance
    return instance
}
