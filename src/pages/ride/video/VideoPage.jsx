import React from "react"
import { useUserSettings } from "incyclist-services";

import { MapOverlay, NearbyRiders, StartRideOverlay, TotalElevationOverlay, UpcomingElevationOverlay, 
         VideoRideView, RouteOptions,RidePageItems, RideProgressPanel, RideMetricsPanel  } from "../../../components/modules/Ride";
import { DynamicWorkoutDashboard } from "../../../components/modules/workout/dashboard/wrapper";
import { Center, ErrorBoundary, Loader } from "../../../components/atoms";
import { MainArea } from "../atoms/MainArea";
import { WorkoutControl } from "../../../components/modules/workout/control";
import { PrevRides } from "../../../components/modules/Ride/lists/PreviousRides";
import { InfoText } from "../../../components/molecules";
import { getRideLayout, toCss } from "../atoms/layout";
import { ShiftingControl } from "../../../components/modules/shifting/control";


export const PAGE_ID = 'Ride'
const CAMERA_SOUND = 'sounds/camera-shutter.mp3';
export const cameraSound = new Audio(CAMERA_SOUND);


export const VideoRidePage = ( { route, state,initialized,startOverlayProps= {},
                                       position, markers, rideView,realityFactor,startPos, endPos,
                                       video, videos, map,upcomingElevation,totalElevation,xScale, yScale,
                                       prevRides,nearbyRides, showShiftingButtons, showDashboard, showWorkout,
                                       screenshotRequested, onScreenshot, onSettings, 
                                       onStartRetry, onStartIgnore, onStartCancel, onToggleCyclingMode
                                    } ) => { 


    const isStarting = state==='Starting' || state==='Idle'
   

    const lapMode = route?.description?.isLoop
    const slopeRange = 2000

    const settings = useUserSettings()
    const deltaX = settings.get('preferences.rideListDeltaX',0)
    // .... STOP TODO

    const opacity = rideView==='map' ? 1 : 0.6

    const showMap = map?.show
    const layout = getRideLayout({
        deltaX,
        workout: showWorkout, upcoming: upcomingElevation?.show, nearby: nearbyRides?.show, prev: prevRides?.show,
        sideViews: false, map: showMap, totalElevation: totalElevation?.show
    })
    const css = Object.fromEntries( Object.keys(layout).map( k=>[k, toCss(layout[k])] ) )

    let View = ()=><Center><Loader/></Center>


    if (initialized && isStarting) {
        const childProps = {...startOverlayProps, onRetry:onStartRetry, onIgnore:onStartIgnore, onCancel:onStartCancel}
        View = ()=><StartRideOverlay {...childProps} />
    }

    const sideViewProps = { stateKey:'sideViews',persistState:true, fold:'top-right', transparent:false, opacity:opacity}
    const isReady = initialized && !isStarting
    let {info} = videos?.length>1 ?  videos.find(v=>!v.hidden) : video??{}
    
    return <MainArea>            
                <ErrorBoundary hideOnError>
                        {!isReady ? <View/> : null}

                        {/* ride view  - in case of a next-video chain, we might have multiple videos (only one is visible)*/}
                        {video?
                            <VideoRideView  {...video} width='100%' height='100%' className={'video:'+video.id} />
                            : null }


                        {/* video views */}
                        { videos?.length>0 ?                        
                            (videos??[]).map( (v)=><VideoRideView width='100%' height='100%' className={'video:'+v.id} key={v.id} {...v}  /> ) 
                            : null                             
                        }
                            
                            
                        { info? <InfoText {...info} /> : null}

                        {/* overlays */}
                        <RidePageItems visible={true} width='100%' height='100%' zIndex={1}  >
                            {/* dashboards and controls */}
                            <RideProgressPanel visible={showDashboard} transparent fold='top-right' foldId='video-progress' opacity={1.0} {...css.progress} />
                            <RideMetricsPanel visible={showDashboard} transparent fold='top-right' foldId='video-metrics' opacity={1.0} {...css.metrics} />
                            <ShiftingControl opacity={1.0} visible={showShiftingButtons && !screenshotRequested} background='none' justify='center' onToggleMode={ onToggleCyclingMode} {...css.shifting} />
                            {layout.workoutPanel ? <DynamicWorkoutDashboard transparent visible={!screenshotRequested} opacity={1.0} {...css.workoutPanel} /> : null}
                            {layout.workoutControl ? <WorkoutControl visible={!screenshotRequested} background='none' onToggleMode={ onToggleCyclingMode} {...css.workoutControl} /> : null}
                            <RouteOptions visible={!isStarting && !screenshotRequested} {...css.routeOptions}
                                transparent={true} pinned={false} settings={true} screenshot={true}
                                onScreenshot={onScreenshot} onSettings={onSettings}/>

                            {/* overlays */}
                            {css.map ? <MapOverlay foldId='map' fold={'top-right'} transparent={true} opacity={1.0} markers = {markers} preview={false} freeRide={false} 
                                minimized = {map?.minimized}
                                {...css.map}
                                routeData={route.details} position={position} startPos={startPos} endPos={endPos} 
                                /> : null}
                            {css.upcoming ? <UpcomingElevationOverlay {...sideViewProps} foldId={'slope'} {...css.upcoming} transparent={true} opacity={1.0}
                                minimized={upcomingElevation?.minimized} 
                                routeData={route.details} lapMode={lapMode} pctReality={realityFactor}
                                showXAxis={true} showYAxis={true} line={{color:'white'}} xScale={xScale} yScale={yScale} range={slopeRange}
                                markers = { []}
                                position={position} /> : null}

                            {css.totalElevation ? <TotalElevationOverlay {...sideViewProps} foldId={'elevation'} transparent={true} opacity={1.0}   
                                {...css.totalElevation}
                                minimized={totalElevation?.minimized} 
                                addPosition={true}
                                routeData={route.details} lapMode={lapMode}
                                showXAxis={false} showYAxis={false} line={{color:'white'}}  pctReality={realityFactor} 
                                position={position}
                                /> : null }
 

                            { css.prev ?
                                <PrevRides rides={prevRides.list} foldId={'prev-rides'} fold={'top-right'}  persistState={true} transparent={true}  opacity={1.0}   
                                minimized={prevRides.minimized}
                                {...css.prev} />
                                : null }                                

                            { css.nearby ?
                                <NearbyRiders observer={nearbyRides?.observer} foldId={'nearby-rides'} fold={'top-right'} persistState={true} transparent={true} opacity={1.0} 
                                minimized={nearbyRides?.minimized}  
                                {...css.nearby} />
                                : null } 


                        </RidePageItems>
                        

                    <View/>
                </ErrorBoundary>
            </MainArea>

}