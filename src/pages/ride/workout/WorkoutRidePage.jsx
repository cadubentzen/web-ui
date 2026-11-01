import React from "react"
import { StartRideOverlay, WorkoutRideView, RouteOptions,RidePageItems, RideProgressPanel, RideMetricsPanel } from "../../../components/modules/Ride";
import { DynamicWorkoutDashboard } from "../../../components/modules/workout/dashboard/wrapper";
import { Center, ErrorBoundary, Loader } from "../../../components/atoms";
import { MainArea } from "../atoms/MainArea";
import { WorkoutControl } from "../../../components/modules/workout/control";
import { getRideLayout, toCss } from "../atoms/layout";


export const PAGE_ID = 'Ride'
const CAMERA_SOUND = 'sounds/camera-shutter.mp3';
export const cameraSound = new Audio(CAMERA_SOUND);


export const WorkoutRidePage = ( {workout, activity, state,initialized,onScreenshot, onSettings, startOverlayProps= {},
                                    onStartRetry, onStartIgnore, onStartCancel, onToggleCyclingMode
                                    } ) => { 

    const isStarting = state==='Starting' || state==='Idle'
    const showDashboard = !!activity

    const layout = getRideLayout({
        workout: true, workoutOnly: true, map: false, totalElevation: false,
        upcoming: false, nearby: false, prev: false, sideViews: false
    })
    const css = Object.fromEntries( Object.keys(layout).map( k=>[k, toCss(layout[k])] ) )

    let View = ()=><Center><Loader/></Center>

    
    if (initialized && isStarting) {
        const childProps = {...startOverlayProps, onRetry:onStartRetry, onIgnore:onStartIgnore, onCancel:onStartCancel}
        View = ()=><StartRideOverlay {...childProps} />
    }


    return <MainArea>            
                <ErrorBoundary hideOnError>

                    {initialized && !isStarting ?
                        <RidePageItems visible={true} width='100%' height='100%' zIndex={1}  >
                            <WorkoutRideView isMain={true} workout={workout} activity={activity} {...css.workoutGraph} />
                            <RideProgressPanel visible={showDashboard} transparent fold='top-right' foldId='workout-progress' opacity={1.0} {...css.progress} />
                            <RideMetricsPanel visible={showDashboard} transparent fold='top-right' foldId='workout-metrics' opacity={1.0} {...css.metrics} />
                            {layout.workoutPanel ? <DynamicWorkoutDashboard transparent visible={!isStarting} opacity={1.0} {...css.workoutPanel} /> : null}
                            {layout.workoutControl ? <WorkoutControl visible={!isStarting} background='none' onToggleMode={ onToggleCyclingMode} {...css.workoutControl} /> : null}
                            <RouteOptions visible={!isStarting} {...css.routeOptions}
                                transparent={true} pinned={true} settings={true} screenshot={true}
                                onScreenshot={onScreenshot} onSettings={onSettings}/>
                        </RidePageItems>
                        :
                        <View/>
                    }

                    <View/>
                </ErrorBoundary>
            </MainArea>

}