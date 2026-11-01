import React, { useRef, useState } from "react"
import 'react-vis/dist/style.css';
import {XYPlot,LineSeries,HorizontalGridLines, XAxis,YAxis,VerticalGridLines,Crosshair, VerticalBarSeries} from 'react-vis';
import styled from 'styled-components';
import { EventLogger}  from 'gd-eventlog';

import { AppThemeProvider, useKitTokens } from "../../../../theme";
import { Autosize, Column, ErrorBoundary, Row } from "../../../atoms";
import { copyPropsExcluding } from "../../../../utils/props";
import { average } from "../../../../utils/coding";
import { getZone, zoneColor } from "../utils";

const ZONE_GRADIENT = `linear-gradient(90deg, ${zoneColor.slice(1).join(', ')})`

const PositionMarker = styled(Crosshair)`
    width:100;
    /* the tooltip brings its own glass frame */
    .rv-crosshair__inner__content { background: transparent; padding: 0; box-shadow: none; }
`

const Tooltip = styled.div`
    background: ${props => props.$background};
    color: inherit;
    border: 1px solid ${props => props.$border};
    border-radius: 0.55em;
    padding: 0.4em 0.8em;
    font-size: 1.5vh;
    width: 20ch;
    white-space: nowrap;
`

const Legend = styled(Row)`
    align-items: center;
    gap: 1.6vw;
    padding: 0 0.5vw 0.6vh;
    font-size: 1.5vh;
    color: ${props => props.$color};
`

const LegendItem = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.5em;
    &::before {
        content: '';
        width: 1.6em;
        height: 0.5em;
        border-radius: 999px;
        background: ${props => props.$swatch};
    }
`

const ContainerArea = styled(Row)`
    width: 100%;
    height: 100%;
`

const ActivityGraphView  = ({activity,ftp,width,height,units}) => {

    const [crosshairValues, setCrosshairValues] = useState([])
    const kit = useKitTokens()

    const refHighlight = useRef()    
    const refData = useRef(null)
    const refCHData = useRef(null)
    const logger = new EventLogger('ActivityGraph')


    const getDisplayMaxValues = (data) =>{

        let minY = Math.min(...data.map(p=>p.y));
        let maxY = Math.max(...data.map(p=>p.y), minY+10);

        const yDomain = [minY,maxY] //, [Math.max(minY-50,0), Math.max(minY+500,maxY)]
        const xDomain = data?.length>0 ? [data[0].x,data[data.length-1].x] : [0,0]

        return [xDomain,yDomain]

    }    

    const getCrosshair = () => {
        if (crosshairValues.length>0) {
            const {x,speed,power,heartrate,elevation} = crosshairValues[0]??{}

            const getDistance = ()=> {
                if (units?.distance) {
                    return `Distance: ${x.toFixed(1)} ${units.distance}` 
                }
                return `Distance: ${(x/1000)?.toFixed(1)} km`
            }

            return (
                <Tooltip $background={kit.dialogBackground} $border={kit.hairline}>
                {getDistance()}<br/>
                { speed!==undefined ? `Speed: ${speed.toFixed(1)} ${units?.speed??'km/h'}` :''}<br/> 
                { power!==undefined ? `Power: ${power.toFixed(0)} W`:''} <br/>
                { heartrate!==undefined ? `Heartrate: ${heartrate.toFixed(0)} bpm` : ''}  <br/> 
                { elevation!==undefined ? `Elevation: ${elevation.toFixed(0)} ${units?.elevation??'m'}` :''}<br/> 
                </Tooltip>
            );
        }
        return(<div></div>)        
    }

    const onNearestX = (value)=>{
        const distance = value?.x??-1

        if (distance===-1)
            return;

        const data = refCHData.current?.[distance]
        if (data) {
            setCrosshairValues([data]);
        }
    }


    const getColor = (P) => {
        const ftpVal = activity?.user?.ftp??ftp
        if (!ftpVal)
            return kit.accent

        return zoneColor[getZone(P/ftpVal*100)]
    }

    const getPowerConfig = () => {
        const ftpVal = activity?.user?.ftp??ftp
        if (!ftpVal) 
            return { swatch:kit.accent, line:kit.accent, style:'line'}        
        else 
            return { swatch:ZONE_GRADIENT, line:kit.accent, style:'bars'}        
    }
    const getHeartrateConfig = () => ({ swatch:kit.heartRate, line:kit.heartRate })

    const getData = ( timeOrDistance='distance') => {
        if (refData.current && width && refData.current?.width===width 
                && activity?.timeTotal===refData.current.timeTotal
                && activity?.id===refData.current.id
            )
             return refData.current

        let power=[], elevation=[], heartrate=[], speed=[]

        try {
            const logs  = (activity?.logs??[]).filter(l=>l!==undefined)
        
            if (!logs||logs.length===0) {
                return({power,elevation,heartrate})
            }        

    
            const dpp = Math.floor(logs.length/width)
            const totalTime = logs[logs.length-1].time
            const totalDistance = logs[logs.length-1].distance

            if (dpp<1) {
                for (let  i=0;i<width;i++) { 
                    const timeTarget = totalTime/width*i
                    const distanceTarget = totalDistance/width*i

                    const target = timeOrDistance==='time' ? timeTarget : distanceTarget
                    const log = timeOrDistance==='time' ? logs.find(l => l.time>=timeTarget) : logs.find(l => l.distance>=distanceTarget)
                    if (!log)
                        continue;
                    
                    power.push({x: target, y: log.power, color:getColor(log.power)})
                    elevation.push({x: target, y: log.elevation})
                    heartrate.push({x: target, y: log.heartrate})
                    speed.push({x: target, y: log.speed})
                }
            }
            else {
                let prevIdx = 0;
                for (let  i=0;i<width;i++) { 
                    try {
                        const timeTarget = totalTime/width*i
                        const distanceTarget = totalDistance/width*i
                        const target = timeOrDistance==='time' ? timeTarget : distanceTarget
    
                        let logIdx =  timeOrDistance==='time' ? logs.findIndex(l => l.time>=timeTarget) : logs.findIndex(l => l.distance>=distanceTarget)
                        if (logIdx===-1)
                            logIdx = logs.length-1

                        const log = {}
                        const values = logs.slice(prevIdx,logIdx)
                        log.power = average( values,'power' )
                        log.elevation = average( values,'elevation' )
                        log.heartrate = average( values,'heartrate' )
                        log.speed = average( values,'speed' )

                        if ( isNaN(log.power) || isNaN(log.elevation) ) {
                            log.power = logs[prevIdx].power
                            log.elevation = logs[prevIdx].elevation
                            log.heartrate = logs[prevIdx].heartrate
                            log.speed = logs[prevIdx].speed
                        }
                        else {
                            power.push({x: target, y: log.power, color:getColor(log.power)})
                            elevation.push({x: target, y: log.elevation})
                            heartrate.push({x: target, y: log.heartrate})
                            speed.push({x: target, y: log.speed})
    
                        }
                        prevIdx = logs[logIdx].x===target ? logIdx+1 : logIdx

                    }
                    catch(err) {
                        console.log(err)
                    }
                }

            }
        }
        catch(err) {
            logger.logEvent({message:'Error', fn:'getData', error:err.message, stack:err.stack})
        }

        refCHData.current = {}
        power.forEach( (p,idx)=> {
            refCHData.current[p.x] = {x:p.x,power:p.y, speed:speed?.[idx]?.y, elevation:elevation?.[idx]?.y,heartrate:heartrate?.[idx]?.y }
        }) 

        heartrate = heartrate.filter(l=> l.x!==undefined && l.y!==undefined )
        power = power.filter(l=> l.x!==undefined && l.y!==undefined )
        speed = speed.filter(l=> l.x!==undefined && l.y!==undefined )
        elevation = elevation.filter(l=> l.x!==undefined && l.y!==undefined )

        if(width) {
            const {id,timeTotal} = activity??{}
            refData.current = {width,power,elevation,heartrate,id,timeTotal}
        }


        return({power,elevation,heartrate})

    }




    const {power,heartrate} = getData()
    const pc = getPowerConfig()
    const hc = getHeartrateConfig()

    if (!width || !height)
        return false
    

    // react-vis defaults (dark text, light grid) are made for a white background
    const gridStyle = { stroke: kit.hairline, strokeOpacity: 0.5 }
    const axisStyle = {
        line: { stroke: kit.hairline },
        ticks: { stroke: kit.hairline },
        text: { stroke: 'none', fill: kit.muted, fontSize: '1.5vh', fontWeight: 400 },
    }

    const xTicks = v => { 
        if (units?.distance)
            return v.toFixed(1)
        return  (v/1000).toFixed(1) 
    }

    return (
        <AppThemeProvider>
            <ErrorBoundary hideOnError debug>
            <Column className="column activityGraph">
                <Legend position='relative' className="row activityGraphLabels" $color={kit.muted}>
                    {power?.length ? <LegendItem $swatch={pc.swatch}>Power</LegendItem>:null}
                    {heartrate?.length ? <LegendItem $swatch={hc.swatch}>Heartrate</LegendItem>:null}
                </Legend>

                <ContainerArea position='relative' ref= {refHighlight}>
                    
                    <div className='graph1' style={{  zIndex:998, top:0, position:'absolute' }}>
                        <XYPlot margin={{right: 40}} width={width} height={height}  >
                            {width && <HorizontalGridLines direction='horizontal' attr='y' style={gridStyle} />}
                            {width && <VerticalGridLines direction='vertical' attr='x' style={gridStyle} />}
                            {width && <XAxis attr='x' tickFormat={ xTicks } style={axisStyle} />}
                            {width && <YAxis attr='y' orientation='left' tickFormat={ v => v? `${v.toFixed(0)}`:undefined } style={{
                                ...axisStyle, text: {...axisStyle.text, fill:pc.line}
                            }}/>}

                            {width && <PositionMarker 
                                values={crosshairValues} 
                                style={ {line:{background:kit.muted, width:2}} } >
                                {getCrosshair()}
                            </PositionMarker>}

                            { pc.style === 'bars' ?
                                <VerticalBarSeries colorType='literal' data={power} /> 
                                : 
                                <LineSeries color={pc.line} data={power}   />
                            }


                        </XYPlot>
                    </div>

                    {(heartrate && heartrate.length>0) && <div className='graph2' style={{ zIndex:999, top:2, position:'absolute' }}>
                        <XYPlot margin={{right: 40}} width={width} height={height} >
                            {width &&  <YAxis attr='y' orientation='right' tickFormat={ v => v? `${v.toFixed(0)}`:undefined }  style={{
                                ...axisStyle, line: {stroke:'none'}, ticks: {stroke:'none'}, text: {...axisStyle.text, fill:hc.line}
                            }}/>}
                            <LineSeries color={hc.line} data={heartrate} onNearestX={onNearestX}     />
                        </XYPlot>
                    </div>}


                </ContainerArea>
            </Column>
            </ErrorBoundary>
        </AppThemeProvider>
    );



}


export const ActivityGraph = (props)  => {

    
    const {width,height} =props
    const childProps = copyPropsExcluding(props, ['width','height'])
    return (
        <Autosize width={width} height={height}>
            <ActivityGraphView {...childProps}/>
        </Autosize>
    )
}