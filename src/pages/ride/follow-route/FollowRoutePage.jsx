import React, { useEffect, useState } from "react"
import { useUserSettings } from "incyclist-services";

import { MapOverlay, NearbyRiders, StartRideOverlay, TotalElevationOverlay, UpcomingElevationOverlay,
         SideViewOverlay, RouteOptions,RidePageItems, RideProgressPanel, RideMetricsPanel } from "../../../components/modules/Ride";
import { DynamicWorkoutDashboard } from "../../../components/modules/workout/dashboard/wrapper";
import { Center, ErrorBoundary, Loader } from "../../../components/atoms";
import { InfoText } from "../../../components/molecules";
import { MainArea } from "../atoms/MainArea";
import { WorkoutControl } from "../../../components/modules/workout/control";
import { GpxRideView } from "../../../components/modules/Ride/views/gpx/GpxRideView";
import { PrevRides } from "../../../components/modules/Ride/lists/PreviousRides";
import { getRideLayout, toCss } from "../atoms/layout";
import { ShiftingControl } from "../../../components/modules/shifting/control";


export const PAGE_ID = 'Ride'
const CAMERA_SOUND = 'sounds/camera-shutter.mp3';
export const cameraSound = new Audio(CAMERA_SOUND);


export const FollowRouteRidePage = ( { workout, activity, route, state,initialized,startOverlayProps= {},
                                       position, markers, hideAll,rideView,realityFactor,startPos, endPos,
                                       displayObserver, onDisplayEvent,displayPosition, sideViews, svInitAllowed, rideViewNotice, svCoverageNotice, svHasCoverage,
                                       map,upcomingElevation,totalElevation,xScale, yScale,
                                       prevRides,nearbyRides, showShiftingButtons, showDashboard, showWorkout,
                                       screenshotRequested, onScreenshot, onSettings,
                                       onStartRetry, onStartIgnore, onStartCancel, onStartWithMap, onToggleCyclingMode
                                    } ) => {


    const isStarting = state==='Starting' || state==='Idle'
    const lapMode = route?.description?.isLoop
    const slopeRange = 2000

    const settings = useUserSettings()
    const deltaX = settings.get('preferences.rideListDeltaX',0)
    // .... STOP TODO

    // the service clears rideViewNotice/svCoverageNotice right after this render, so the key is
    // captured here to keep InfoText showing for its own timeout instead of disappearing on the
    // very next page update
    const [fallbackNoticeKey, setFallbackNoticeKey] = useState(undefined)
    useEffect( ()=> { if (rideViewNotice) setFallbackNoticeKey(Date.now()) }, [rideViewNotice])
    const [coverageNoticeKey, setCoverageNoticeKey] = useState(undefined)
    useEffect( ()=> { if (svCoverageNotice) setCoverageNoticeKey(svCoverageNotice.ts) }, [svCoverageNotice])

    const opacity = rideView==='map' ? 1 : 0.6

    let View = ()=><Center><Loader/></Center>


    if (initialized && isStarting) {
        const childProps = {...startOverlayProps, onRetry:onStartRetry, onIgnore:onStartIgnore, onCancel:onStartCancel, onStartWithMap:onStartWithMap}
        View = ()=><StartRideOverlay {...childProps} />
    }

    const sideViewProps = { stateKey:'sideViews',persistState:true, fold:'top-right', transparent:false, opacity:opacity}
    const isReady = initialized && !isStarting
    const showMap = map?.show && rideView!=='map'

    const layout = getRideLayout({
        deltaX,
        workout: showWorkout, upcoming: upcomingElevation?.show, nearby: nearbyRides?.show, prev: prevRides?.show,
        sideViews: sideViews?.enabled, map: showMap, totalElevation: totalElevation?.show
    })
    const css = Object.fromEntries( Object.keys(layout).map( k=>[k, toCss(layout[k])] ) )

    
    return <MainArea>
                <ErrorBoundary hideOnError>
                        {!isReady ? <View/> : null}

                        {fallbackNoticeKey ? <InfoText text="Street View isn't available right now. Showing the Map instead." routeDistance={fallbackNoticeKey} timeout={8000} /> : null}
                        {coverageNoticeKey && svHasCoverage!==true ? <InfoText text="No Street View imagery at this location." routeDistance={coverageNoticeKey} timeout={8000} /> : null}

                        <RidePageItems visible={true} width='100%' height='100%' zIndex={1}  >
                            {/* ride view */}
                            <GpxRideView visible={true} isMain={true} position={displayPosition} route={route} rideView={rideView} svInitAllowed={svInitAllowed} onEvent={onDisplayEvent} observer={displayObserver} />

                            {/* dashboards and controls */}
                            <RideProgressPanel visible={showDashboard} transparent fold='top-right' foldId='gpx-progress' opacity={1.0} {...css.progress} />
                            <RideMetricsPanel visible={showDashboard} transparent fold='top-right' foldId='gpx-metrics' opacity={1.0} {...css.metrics} />
                            <ShiftingControl opacity={1.0} visible={showShiftingButtons&& !screenshotRequested} background='none' justify='center' onToggleMode={ onToggleCyclingMode} {...css.shifting} />

                            {layout.workoutPanel ? <DynamicWorkoutDashboard transparent visible={true} opacity={1.0} {...css.workoutPanel} /> : null}
                            {layout.workoutControl ? <WorkoutControl visible={!screenshotRequested} background='none' onToggleMode={ onToggleCyclingMode} {...css.workoutControl} /> : null}
                            <RouteOptions visible={!isStarting&& !screenshotRequested} {...css.routeOptions}
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
                                showXAxis={true} showYAxis={true} xScale={xScale} yScale={yScale} line={{color:'white'}} range={slopeRange}
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

                            {css.svLeft ? 
                                <SideViewOverlay {...sideViewProps} {...css.svLeft} foldId='sv-left' hidden={sideViews.hide}
                                useMinimizeProp
                                direction='left'  position={displayPosition}  observer={displayObserver} svInitAllowed={svInitAllowed}
                                minimized={!sideViews?.left} transparent={false} opacity={1}
                                />                            
                            : null}
                            {css.svRight ? 
                                <SideViewOverlay {...sideViewProps} {...css.svRight} foldId='sv-right'  hidden={sideViews.hide}
                                useMinimizeProp
                                direction='right' position={displayPosition} observer={displayObserver} svInitAllowed={svInitAllowed}
                                minimized={!sideViews?.right} transparent={false} opacity={1}
                                />                            
                            : null}

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