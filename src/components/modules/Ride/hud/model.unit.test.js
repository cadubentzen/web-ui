import { toHudModel } from './model'

const powerGauge = { min:0, max:400, zones:[{from:0,to:200,color:'#0f0',name:'Z1'}], zone:'Z1', target:{min:150,max:180} }
const hrGauge = { min:60, max:200 }

const items = [
    { title:'Time', data:[{value:'0:10:01'},{value:'-0:49:59'}]},
    { title:'Distance', data:[{value:'1.80',unit:'km'},{value:'-9.20'}]},
    { title:'Speed', data:[{value:'31.2',unit:'km/h'},{value:'55.0', label:'max'}]},
    { title:'Power', data:[{value:'152',unit:'W'},{value:'170',label:'avg'}], gauge:powerGauge, dataState:'amber'},
    { title:'Slope', data:[{value:'11.5',unit:'%',info:'RF 50%'},{value:'7',label:'gain',unit:'m'}]},
    { title:'Heartrate', data:[{value:'112',unit:'bpm'},{value:'99', label:'avg'}], gauge:hrGauge},
    { title:'Cadence', data:[{value:'82',unit:'rpm'},{value:'89',label:'avg'}]},
    { title:'Gear', data:[{value:'+2',unit:''}], gearCount:24},
]

const without = (...titles) => items.filter(i => !titles.includes(i.title))

describe('toHudModel', () => {
    test('row order is speed, slope, cadence, gear', () => {
        expect(toHudModel(items).row.map(m => m.key)).toEqual(['speed','slope','cadence','gear'])
    })

    test('absent slope and gear are skipped', () => {
        expect(toHudModel(without('Slope','Gear')).row.map(m => m.key)).toEqual(['speed','cadence'])
    })

    test('empty values become an en dash', () => {
        const m = toHudModel(items.map(i => i.title==='Heartrate' ? {...i, data:[{value:'',unit:'bpm'},i.data[1]]} : i))
        expect(m.heartrate.value).toBe('–')
        const m2 = toHudModel(items.map(i => i.title==='Cadence' ? {...i, data:[{value:undefined,unit:'rpm'},i.data[1]]} : i))
        expect(m2.row.find(r => r.key==='cadence').value).toBe('–')
    })

    test('time and distance remaining use a minus sign', () => {
        const m = toHudModel(items)
        expect(m.time).toEqual({ value:'0:10:01', remaining:'−0:49:59' })
        expect(m.distance).toEqual({ value:'1.80', unit:'km', remaining:'−9.20' })
    })

    test('a zero remaining distance (route-less workout) is omitted', () => {
        const m = toHudModel(items.map(i => i.title==='Distance' ? {...i, data:[{value:'0.00',unit:'km'},{value:'-0.00'}]} : i))
        expect(m.distance.remaining).toBeUndefined()
        const m2 = toHudModel(items)
        expect(m2.distance.remaining).toBe('−9.20')
    })

    test('missing remaining is omitted', () => {
        const m = toHudModel(items.map(i => i.title==='Time' ? {...i, data:[{value:'0:10:01'},{}]} : i))
        expect(m.time.remaining).toBeUndefined()
    })

    test('avg/max/gain second rows never appear', () => {
        const json = JSON.stringify(toHudModel(items))
        for (const v of ['55.0','170','"99"','"89"','"7"','avg','gain']) expect(json).not.toContain(v)
    })

    test('slope badge is normalised to "RF 50%"', () => {
        const slope = m => m.row.find(r => r.key==='slope')
        expect(slope(toHudModel(items)).badge).toBe('RF 50%')
        const old = items.map(i => i.title==='Slope' ? {...i, data:[{...i.data[0],info:'50% RF'},i.data[1]]} : i)
        expect(slope(toHudModel(old)).badge).toBe('RF 50%')
        const none = items.map(i => i.title==='Slope' ? {...i, data:[{...i.data[0],info:''},i.data[1]]} : i)
        expect(slope(toHudModel(none)).badge).toBeUndefined()
    })

    test('amber/red dataState becomes state, green is dropped', () => {
        const m = toHudModel(items)
        expect(m.power.state).toBe('amber')
        expect(m.heartrate.state).toBeUndefined()
        const red = toHudModel(items.map(i => i.title==='Speed' ? {...i, dataState:'red'} : i))
        expect(red.row[0].state).toBe('red')
        const green = toHudModel(items.map(i => i.title==='Speed' ? {...i, dataState:'green'} : i))
        expect(green.row[0].state).toBeUndefined()
    })

    test('gauge is passed through unchanged', () => {
        const m = toHudModel(items)
        expect(m.power.gauge).toBe(powerGauge)
        expect(m.heartrate.gauge).toBe(hrGauge)
        expect(m.power.key).toBe('power')
        expect(m.heartrate.key).toBe('heartrate')
    })

    test('gear carries gearCount', () => {
        const gear = toHudModel(items).row.find(r => r.key==='gear')
        expect(gear).toMatchObject({ value:'+2', gearCount:24 })
    })

    test('pace and imperial units pass through', () => {
        const m = toHudModel(items.map(i =>
            i.title==='Speed' ? {...i, data:[{value:'2:05',unit:''},i.data[1]]} :
            i.title==='Distance' ? {...i, data:[{value:'1.1',unit:'mi'},{value:'-5.0'}]} : i))
        expect(m.row[0]).toMatchObject({ key:'speed', value:'2:05', unit:'' })
        expect(m.distance.unit).toBe('mi')
        expect(m.distance.remaining).toBe('−5.0')
    })

    test('empty or undefined input yields placeholders', () => {
        const m = toHudModel(undefined)
        expect(m.time.value).toBe('–')
        expect(m.row).toEqual([])
        expect(m.power.value).toBe('–')
    })
})
