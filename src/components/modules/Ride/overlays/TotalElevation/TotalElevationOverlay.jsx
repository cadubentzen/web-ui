import { copyPropsExcluding } from "../../../../../utils/props"
import React, { useContext } from "react"
import {ElevationGraph} from "../../../../molecules/ElevationGraph/ElevationGraph"
import styled, { ThemeContext } from "styled-components"
import { Dynamic } from "../../../../atoms"
import { useActiveRides  } from "incyclist-services"
import { EventLogger } from "gd-eventlog"
import { hudTokens } from '../../../../../theme'

const DEFAULT_MAX_UPDATE_FREQ = 1000


// the ridden part of the profile is drawn in the accent colour, the rest in white
const RIDDEN_OPACITY = 0.45
const REST_OPACITY = 0.12

const toRgba = (hex, alpha) => {
    const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex ?? '')
    return m ? `rgba(${parseInt(m[1],16)},${parseInt(m[2],16)},${parseInt(m[3],16)},${alpha})` : hex
}

const getRiddenPct = ({position, routeData, lapMode}) => {
    const distance = typeof position==='number' ? position : position?.routeDistance
    const total = routeData?.distance
    if (!Number.isFinite(distance) || !(total>0))
        return 0
    const ridden = lapMode ? distance % total : distance
    return Math.min(100, Math.max(0, ridden / total * 100))
}

const Container = styled.div`
    box-sizing: border-box;
    width: ${props => props.width || '100%'};
    height: ${props => props.height || '100%'};
    background: ${p => hudTokens(p.theme).panel};
    border: 1px solid ${p => hudTokens(p.theme).border};
    border-radius: ${p => hudTokens(p.theme).radius};
    display:flex;
    overflow:hidden;
    position:relative;
`

const Part = styled.div`
    position: absolute;
    inset: 0;
    clip-path: ${p => p.$clip};
`

/*
    TODO:  this components needs to be refactored after the ride page has been changed and the context has been removed
            due to the cavailablitly of the context, the component gets rendered many times ( basically any time something changes somewhere)
            whereas it should only change if its key props would change

            I.e. the shouldComponentUpdate() calls in ths component and the ElevationGraph component can be removed of simplified and event some of the wrapper layers should be removed
*/


export class TotalElevationOverlay extends React.Component {


    constructor(props) {
        super(props)
        this.maxUpdateFreq = props.maxUpdateFreq??DEFAULT_MAX_UPDATE_FREQ
        this.prevRender = 0
        this.logger = new EventLogger('TotalElevationOverlay')
        this.service = useActiveRides()
        this.hasActiveRides = this.service.get().length>0
    }
    
    
    shouldComponentUpdate(newProps) {

        if (!this.prevRender)
            return true

        try {
            if (!this.newActiveRides){
                //return true
                return  newProps.position?.routeDistance!==this.props.position?.routeDistance || 
                        newProps.routeData?.distance !==this.props.routeData?.distance ||
                        Math.abs(newProps.pctReality-this.props.pctReality)>0.01 ||
                        newProps.range!==this.props.range
            }

            const hasActiveRides = this.service?.get().length>0
            

            const hasActiveRidesChanged = (hasActiveRides && !this.hasActiveRides) || (!hasActiveRides && !this.hasActiveRides)
            const posChanged = newProps.position?.routeDistance!==this.props.position?.routeDistance
            const routeChanged = newProps.routeData?.distance!==this.props.routeData?.distance
        
            this.hasActiveRides = hasActiveRides

            if (hasActiveRidesChanged || routeChanged )
                return true
            
            return (posChanged && Date.now() - this.prevRender > this.maxUpdateFreq)
        }
        catch(err) {
            this.logger.logEvent({message:'error',fn:'shouldComponentUpdate', error:err.message, stack:err.stack})
            return true
        }
    }
    

    render() {
        try {
            
            this.prevRender = Date.now()
            let childProps = this.props??{}
            if (this.newActiveRides) {
        
                const hasActiveRides = this.service?.get().length>0
                let excludes = ['markers','rideState','visible','observer','onSettingsChanged','opacity','settings']          
                
                if (hasActiveRides) {
                    excludes.push('position')
                }
                childProps = copyPropsExcluding(this.props,excludes) 

                if (hasActiveRides) {
                    childProps.observer = this.service.getObserver()
                }
                
            }
        
        
            
            return <TotalElevationOverlayView {...childProps} />
        }
        catch(err) {
            console.log('# error',err)
            return <TotalElevationOverlayView {...this.props} />
        }    
    }


}

export const TotalElevationOverlayView = (props) =>{

    const t = hudTokens(useContext(ThemeContext))
    const Graph = React.memo( ElevationGraph)

    const propsGraph = copyPropsExcluding(props,['observer','markers','position','rideState','visible','observer','onSettingsChanged','opacity','settings'])
    const propsPos = copyPropsExcluding(props,['observer','markers','rideState','visible','observer','onSettingsChanged','opacity','settings'])

    const pct = getRiddenPct(props)

    return( 
        <Container className='elevation-wrapper'>
            {props.observer? 
                <Dynamic observer={props.observer} event='update' prop='activityList' >
                    <ElevationGraph {...propsPos} activityList={[]} hideBars={true} wrapped={true}/> 
                </Dynamic>
                :
                <Graph {...propsPos} markers={props.markers} hideBars={true} wrapped={true} /> 
            }

            <Part $clip={`inset(0 0 0 ${pct}%)`}>
                <ElevationGraph {...propsGraph} barColor={toRgba(t.text, REST_OPACITY)} hideBars={false} wrapped={true} />
            </Part>
            <Part $clip={`inset(0 ${100-pct}% 0 0)`}>
                <ElevationGraph {...propsGraph} barColor={toRgba(t.accent, RIDDEN_OPACITY)} hideBars={false} wrapped={true} />
            </Part>
        </Container>
    )
}
