import { describe, expect, test, vi, afterEach } from 'vitest'
import { PlayKeyPadStatus, PlayButtonStatus } from 'incyclist-devices'
import { ADDRESSES, CONTROL, MEASUREMENT, MockZwiftPlayBinding, RESPONSE, encodeKeyPadStatus } from './zwiftPlay'

const discoverAll = async (binding) => {
    const found = []
    binding.on('discover', p => found.push(p))
    binding.startScanning([], false, () => {})
    await vi.advanceTimersByTimeAsync(400)
    return found
}

const connect = async (peripheral) => {
    const p = peripheral.connectAsync()
    await vi.advanceTimersByTimeAsync(100)
    await p
    const { characteristics } = await peripheral.discoverSomeServicesAndCharacteristicsAsync([], [])
    return Object.fromEntries(characteristics.map(c => [c.uuid, c]))
}

describe('MockZwiftPlayBinding', () => {
    afterEach(() => vi.useRealTimers())

    test('key pad status decodes like a real Zwift Play notification', () => {
        const left = PlayKeyPadStatus.fromBinary(encodeKeyPadStatus('left', 5).subarray(1))
        expect(left.rightPad).toBe(PlayButtonStatus.OFF)
        expect(left.buttonBDown).toBe(PlayButtonStatus.ON)
        expect(left.buttonYUp).toBe(PlayButtonStatus.OFF)

        const right = PlayKeyPadStatus.fromBinary(encodeKeyPadStatus('right', undefined).subarray(1))
        expect(right.rightPad).toBe(PlayButtonStatus.ON)
        expect(right.buttonARight).toBe(PlayButtonStatus.OFF)
    })

    test('announces both halves as "Zwift Play" with their MAC as id', async () => {
        vi.useFakeTimers()
        const binding = new MockZwiftPlayBinding(null)
        const found = await discoverAll(binding)
        expect(found.map(p => [p.name, p.id])).toEqual([['Zwift Play', ADDRESSES.left], ['Zwift Play', ADDRESSES.right]])
        expect(found[0].advertisement.serviceUuids).toEqual(['00000001-19ca-4651-86e5-fa29dcdd09d1'])
    })

    test('answers RideOn and sends a click (press + release) to every subscribed wrapper', async () => {
        vi.useFakeTimers()
        const binding = new MockZwiftPlayBinding(null)
        const [left] = await discoverAll(binding)
        const chars = await connect(left)

        const responses = []
        chars[RESPONSE].on('data', d => responses.push(d.toString()))
        chars[RESPONSE].subscribe(() => {})
        chars[CONTROL].write(Buffer.from('RideOn'), true)
        await vi.advanceTimersByTimeAsync(50)
        expect(responses).toEqual(['RideOn'])

        // a second wrapper for the same physical device (e.g. a second sensor) gets the data too
        const [again] = await discoverAll(binding)
        const chars2 = await connect(again)
        const got1 = [], got2 = []
        chars[MEASUREMENT].on('data', d => got1.push(d.toString('hex')))
        chars2[MEASUREMENT].on('data', d => got2.push(d.toString('hex')))
        chars[MEASUREMENT].subscribe(() => {})
        chars2[MEASUREMENT].subscribe(() => {})

        const pressed = binding.press('dpad-down')
        await vi.advanceTimersByTimeAsync(100)
        expect(await pressed).toBe(2)
        expect(got1).toEqual([encodeKeyPadStatus('left', 5).toString('hex'), encodeKeyPadStatus('left').toString('hex')])
        expect(got2).toEqual(got1)
    })

    test('power off disconnects the half and hides it from scans until powered on', async () => {
        vi.useFakeTimers()
        const binding = new MockZwiftPlayBinding(null)
        const [, right] = await discoverAll(binding)
        await connect(right)
        const onDisconnect = vi.fn()
        right.on('disconnect', onDisconnect)

        binding.powerOff('right')
        expect(onDisconnect).toHaveBeenCalled()
        const found = await discoverAll(binding)
        expect(found.map(p => p.id)).toEqual([ADDRESSES.left])

        const announced = []
        binding.on('discover', p => announced.push(p.id))
        binding.powerOn('right')
        expect(announced).toEqual([ADDRESSES.right])
    })

    test('rejects unknown keys', async () => {
        await expect(new MockZwiftPlayBinding(null).press('nope')).rejects.toThrow(/unknown key/)
    })
})
