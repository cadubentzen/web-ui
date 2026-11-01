import React, { useEffect, useState }  from "react"
import { MapOverlay, StartRideOverlay, SideViewOverlay, RouteOptions,RidePageItems, RideProgressPanel, RideMetricsPanel } from "../../../components/modules/Ride";
import { DynamicWorkoutDashboard } from "../../../components/modules/workout/dashboard/wrapper";
import { Center, ErrorBoundary, Loader } from "../../../components/atoms";
import { InfoText } from "../../../components/molecules";
import { MainArea } from "../atoms/MainArea";
import { WorkoutControl } from "../../../components/modules/workout/control";
import { GpxRideView } from "../../../components/modules/Ride/views/gpx/GpxRideView";
import { getRideLayout, toCss } from "../atoms/layout";
import { ShiftingControl } from "../../../components/modules/shifting/control";


export const PAGE_ID = 'FreeRide'
const CAMERA_SOUND = 'sounds/camera-shutter.mp3';
export const cameraSound = new Audio(CAMERA_SOUND);


export const FreeRideRidePage = ( { workout, activity, route, state,initialized,startOverlayProps= {},
                                       position, markers, options, hideAll,rideView,
                                       displayObserver, onDisplayEvent,displayPosition, sideViews, svInitAllowed, rideViewNotice, svCoverageNotice, svHasCoverage,
                                       showShiftingButtons, showDashboard, showWorkout,
                                       map,optionProps,
                                       screenshotRequested, onScreenshot, onSettings, onFreeRideOptionSelected,
                                       onStartRetry, onStartIgnore, onStartCancel, onStartWithMap, onToggleCyclingMode
                                    } ) => { 


    const isStarting = state==='Starting' || state==='Idle'



    const opacity = rideView==='map' ? 1 : 0.6

    const [fallbackNoticeKey, setFallbackNoticeKey] = useState(undefined)
    useEffect( ()=> { if (rideViewNotice) setFallbackNoticeKey(Date.now()) }, [rideViewNotice])
    const [coverageNoticeKey, setCoverageNoticeKey] = useState(undefined)
    useEffect( ()=> { if (svCoverageNotice) setCoverageNoticeKey(svCoverageNotice.ts) }, [svCoverageNotice])

    let View = ()=><Center><Loader/></Center>
    if (initialized && isStarting) {
        const childProps = {...startOverlayProps, onRetry:onStartRetry, onIgnore:onStartIgnore, onCancel:onStartCancel, onStartWithMap:onStartWithMap}
        View = ()=><StartRideOverlay {...childProps} />
    }

    const sideViewProps = { stateKey:'sideViews',persistState:true, fold:'top-right', transparent:false, opacity:opacity}
    const isReady = initialized && !isStarting
    const showMap = map?.show && rideView!=='map'

    const layout = getRideLayout({
        workout: showWorkout, upcoming: false, nearby: false, prev: false,
        sideViews: sideViews?.enabled, map: showMap, totalElevation: false
    })
    const css = Object.fromEntries( Object.keys(layout).map( k=>[k, toCss(layout[k])] ) )

    return <MainArea>            
                <ErrorBoundary hideOnError>
                        {!isReady ? <View/> : null}

                        {fallbackNoticeKey ? <InfoText text="Street View isn't available right now. Showing the Map instead." routeDistance={fallbackNoticeKey} timeout={8000} /> : null}
                        {coverageNoticeKey && svHasCoverage!==true ? <InfoText text="No Street View imagery at this location." routeDistance={coverageNoticeKey} timeout={8000} /> : null}

                        <RidePageItems visible={true} width='100%' height='100%' zIndex={1}  >
                            {/* ride view */}
                            <GpxRideView visible={true} options={options} isMain={true} position={displayPosition} route={route} rideView={rideView} svInitAllowed={svInitAllowed} onEvent={onDisplayEvent} observer={displayObserver} />

                            {/* dashboards and controls */}
                            <RideProgressPanel visible={showDashboard} transparent fold='top-right' foldId='free-progress' opacity={1.0} {...css.progress} />
                            <RideMetricsPanel visible={showDashboard} transparent fold='top-right' foldId='free-metrics' opacity={1.0} {...css.metrics} />
                            <ShiftingControl opacity={1.0} visible={showShiftingButtons&& !screenshotRequested} background='none' justify='center' onToggleMode={ onToggleCyclingMode} {...css.shifting} />

                            {layout.workoutPanel ? <DynamicWorkoutDashboard transparent visible={!screenshotRequested} opacity={1.0} {...css.workoutPanel} /> : null}
                            {layout.workoutControl ? <WorkoutControl visible={!screenshotRequested} background='none' onToggleMode={ onToggleCyclingMode} {...css.workoutControl} /> : null}
                            <RouteOptions visible={!isStarting && !screenshotRequested} {...css.routeOptions}
                                options={options}  settings={true} screenshot={true}                                 
                                {...optionProps}
                                transparent={true} pinned={false} 
                                onScreenshot={onScreenshot} onSettings={onSettings} onOptionSelected={onFreeRideOptionSelected} />

                            {/* overlays */}
                            {css.map ? <MapOverlay foldId='map' fold={'top-right'} transparent={true} opacity={1.0}                             
                                viewport={map.viewport} center={map.center} bounds= {map.bounds} viewportOverwrite={map.viewportOverwrite} onViewportChange={map.onViewportChange}
                                preview={false} freeRide={false}    
                                minimized = {map?.minimized}
                                {...css.map}
                                routeData={route.details} position={position} options={options} markers = {markers} 
                                /> : null}

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

                        </RidePageItems>

                    <View/>
                </ErrorBoundary>
            </MainArea>

}