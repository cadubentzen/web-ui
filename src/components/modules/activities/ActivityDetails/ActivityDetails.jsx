import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { Button, ButtonBar, ErrorBoundary, Loader } from '../../../atoms'
import { Panel } from '../../../atoms/Panel'
import { kitTokens } from '../../../../theme'
import { Dialog, FreeMap } from '../../../molecules'
import { formatDateTime, useActivityList} from 'incyclist-services'
import { ActivityGraph,FilePill,UploadPill,ScreenshotGallery,ScreenshotPopup} from '../../../molecules/Activity'
import { EventLogger } from 'gd-eventlog'
import { useAppUI } from '../../../../bindings/native-ui'

import { Marker } from "react-leaflet";
import L, { icon } from 'leaflet';

const ContentArea = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.4vh;
    box-sizing: border-box;
    height: calc(100% - 7.7vh);
    width: 100%;
    padding: 0 1.4vw 1.4vh;
    font-size: 1.7vh;
`

const TopRow = styled.div`
    display: flex;
    gap: 1.4vw;
    flex: 0 0 36%;
    min-height: 0;
`

const MapPanel = styled(Panel)`
    flex: 1 1 50%;
    min-width: 0;
    overflow: hidden;
    position: relative;
`

// info grid: muted labels in one column, values (and the chips) in the other
const InfoPanel = styled(Panel)`
    flex: 1 1 50%;
    min-width: 0;
    box-sizing: border-box;
    padding: 1.4vh 1.4vw;
    overflow-y: auto;
    display: grid;
    grid-template-columns: max-content minmax(0, 1fr);
    grid-auto-rows: min-content;
    align-content: start;
    align-items: center;
    gap: 0.9vh 1.6vw;
`

const InfoLabel = styled.div`
    color: ${props => kitTokens(props.theme).muted};
`

const InfoValue = styled.div`
    font-weight: 600;
    overflow-wrap: anywhere;
`

const Chips = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.6vh 0.5vw;
`

const GraphPanel = styled(Panel)`
    flex: 1 1 auto;
    min-height: 0;
    padding: 1.2vh 1vw;
    position: relative;
    display: flex;
    flex-direction: column;
`

const GraphSlot = styled.div`
    flex: 1 1 auto;
    min-height: 0;
    position: relative;
`

// Delete is set apart on the left; the other actions are right-aligned, the primary one last
const Footer = styled(ButtonBar)`
    gap: 0.8vw;
    padding: 0 1.4vw;
    box-sizing: border-box;
    background: transparent;
    border-top: 1px solid ${props => kitTokens(props.theme).hairline};

    & > * { flex: none; max-width: none; margin: 0; }
    & button { overflow: visible; max-width: none; margin: 0; }
`

const Slot = styled.div`
    order: ${props => props.$order};
    ${props => props.$start ? 'margin-right: auto;' : ''}
`

const InfoRow = ({label, children}) => <>
    <InfoLabel>{label}</InfoLabel>
    <InfoValue>{children}</InfoValue>
</>

export const ActivityDetails = ({activity, units, title,started,duration, distance, elevation,logs, points, 
                                showMap,startPos,segment,loading,
                                canStart, canOpen,exports, uploads,                                
                                onCancel, onStart, onOpen, onOpenUpload, onOpenExport,onDelete, onExport, onUpload}) => { 

    const [dialogState,setDialogState] = useState(null)
    const logger = useRef(new EventLogger('ActivityDetails')).current

    const [markerSize, setMarkerSize] = useState()

    

    const screenshots = activity?.screenshots??[]
    const myIcon = useMemo( ()=> {
        let size = Number(markerSize)
        if (Number.isNaN(size))
            size = 24;
        return new L.Icon({
            iconUrl: 'images/camera.svg',
            iconRetinaUrl: 'images/camera.svg',
            popupAnchor:  [-0, -0],
            iconSize: [size,size],     
        })
    },[markerSize]);

    const onViewportChanged = (v)=> {
        if ( !v?.zoom)
            return;
        setMarkerSize (Number(24/20*v.zoom).toFixed(0))   
    }    

    useEffect(() => {
        if (dialogState===null)
            setDialogState('open')
        
    }, [dialogState]);

    const close = async () =>{
        setDialogState('closed')
        await new Promise(done => process.nextTick(()=>{done()}))
    }

    const onCancelClicked = async () => {
        await close();

        if (typeof onCancel === 'function') {
            onCancel()
        }
    }

    const onStartClicked = async () => {
        await close();

        if (typeof onStart === 'function') {
            onStart()
        }
    }

    const onDeleteClicked = async () => {
        await close();

        if (typeof onDelete === 'function') {
            onDelete()
        }
    }

    const onOpenClicked = async () => {
        await close();

        if (typeof onOpen === 'function') {
            onOpen()
        }
    }

    const getDateTime =(start) => {
        let str = ''
        try {
            if (start) {
                str = formatDateTime(start,'%d.%m.%Y %H:%M')            
            }
        }
        catch(err) {
            logger.logEvent({message:'error',fn:'getDateTime',error:err.message,stack:err.stack,start})
        }
        return str
        
    }

    const getDuration =(rideTime) => {
        let duration = ''

        try {
            if (rideTime) {
                const hours = Math.floor(rideTime / 3600)
                const minutes = Math.floor((rideTime % 3600) / 60)
                if (hours > 0)
                    duration = `${hours}h ${minutes}min`
                else
                    duration = `${minutes}min`
            }

        }
        catch(err) {
            logger.logEvent({message:'error',fn:'getDuration',error:err.message,stack:err.stack,rideTime})
        }
        return duration
        
    }

    const formatted = (v,digits)=> {

        const {value,unit} = v

        if (digits===undefined)
            return `${value} ${unit}`
        return `${value.toFixed(digits)} ${unit}`
    }

    const getElevation = () => {
        let str = ''

        try {
            if (elevation===undefined || elevation===null)
                return ''

            if (typeof elevation==='number') {
                return `${elevation.toFixed(0)} m`
            }

            if (elevation.value!==undefined && elevation.unit) 
                return formatted(elevation)


        }
        catch(err) {
            logger.logEvent({message:'error',fn:'getElevation',error:err.message,stack:err.stack,elevation})
        }
        return str
    }

    const getFiles = ()=>{
        
        const files = (exports??[]).map(e => ({
            text:e?.type,
            tone: e?.file ? 'ok' : 'idle',
            canOpen: e?.file!==undefined && e?.file!==null,
            canCreate: e?.file===undefined,
            loading:e?.creating
        }))
        return files
    }
    const getUploads = ()=>{

        try {
            // Some code here
            const files = (uploads??[]).map(e => {
                const failed = e?.status === 'failed'
                const success = e?.status === 'success'
                // activity details haven't arrived yet - the real status is still unknown, so the
                // pill must not offer Synchronize/Open until the details finish loading (issue #48)
                const stillLoading = e?.status === 'loading'
                const canOpen = success;
                const canSynchronize = !success && !stillLoading
                const loading = e?.synchronizing || stillLoading

                const tone = failed ? 'failed' : success ? 'ok' : 'idle'

                return{
                        tone,
                        text:e?.text??e?.type,
                        canOpen,canSynchronize,
                        type:e?.type,
                        loading

            }})
            return files
        }
        catch (error) {
            logger.logEvent({message:'error',fn:'getUploads',error:error.message,stack:error.stack,uploads})
            return []
        }

    }

    const getDistance = (distance)=>{
        try {
            if (distance===undefined && distance!==null)
                return ''
            if (typeof distance==='number')
                return `${(distance/1000).toFixed(1)} km`
            if (distance.value!==undefined && distance.unit) 
                return formatted(distance,1)


        }
        catch (error) {
            logger.logEvent({message:'error',fn:'getDistance',error:error.message,stack:error.stack,meters: distance})
            return ''
        }
    }

    if (loading){
        return (
            <ErrorBoundary>
                <Dialog width='90vw' height='90vh' id='ActivityDetails' log={{title:title}} title={title??'Activity'} /*onOutsideClicked={onUserCancel}*/ zIndex={100} onESC={onCancelClicked}>
                    <ContentArea>
                        <Loader />
                    </ContentArea>
                    <Footer justify='flex-end'>
                        <Button text='Close' onClick={onCancelClicked} />
                    </Footer>
                </Dialog>
            </ErrorBoundary>

        )
    }

    return ( 
        
            <Dialog width='90vw' height='90vh' id='ActivityDetails' log={{title:title}} title={title} /*onOutsideClicked={onUserCancel}*/ zIndex={100} onESC={onCancelClicked}>
            <ContentArea>
                <TopRow>
                    {showMap ? <MapPanel>
                        <FreeMap  
                            zoomControl={true} points={points} startPos={0} draggable={false}
                            onViewportChanged={onViewportChanged }
                        >
                                {(screenshots?.length>0) && screenshots.filter(s => !!s.position).map ( (s) => 
                                    <ErrorBoundary hideOnError key = {`${s.position}`}>
                                        <Marker
                                            icon = {myIcon}
                                            draggable={false}
                                            position={ [s.position.lat, s.position.lng]}
                                        >
                                            <ScreenshotPopup screenshot={s} />
                                        </Marker>
                                    </ErrorBoundary>
                                    
                                )}                

                        </FreeMap>
                    </MapPanel> : null}
                    <InfoPanel>
                        <InfoRow label='Started'>{getDateTime(started)}</InfoRow>
                        <InfoRow label='Duration'>{getDuration(duration)}</InfoRow>
                        {startPos ? <InfoRow label='Start At'>{getDistance(startPos)}</InfoRow>:null}
                        {segment ? <InfoRow label='Segment'>{segment}</InfoRow>:null}
                        <InfoRow label='Distance'>{getDistance(distance)}</InfoRow>
                        <InfoRow label='Elevation'>{getElevation()}</InfoRow>
                        <InfoLabel>Files</InfoLabel>
                        <Chips>
                            {getFiles().map((e,i) => <FilePill key={e.text} {...e} 
                                onOpen={()=>onOpenExport(exports[i])}
                                onCreate={()=>onExport(exports[i])}
                            />)}
                        </Chips>
                        <InfoLabel>Uploads</InfoLabel>
                        <Chips>
                            {getUploads().map((e,i) => <UploadPill key={e.text} {...e} 
                                onOpen={()=>onOpenUpload(uploads[i])}
                                onSynchronize={()=>onUpload(uploads[i])}
                            />)}
                        </Chips>
                    </InfoPanel>
                </TopRow>
                <GraphPanel>
                    <GraphSlot className='ActivityGraphRow'>
                        <ActivityGraph activity={activity} units={units} dialog={this}/>
                    </GraphSlot>
                </GraphPanel>

                { screenshots.length>0 ? <ScreenshotGallery screenshots={screenshots} /> : null }

            </ContentArea>
            <Footer justify='flex-end'>
                <Slot $order={3}><Button primary={canStart} text='Ride Again' onClick={onStartClicked} disabled={!canStart} /></Slot>
                <Slot $order={2}><Button primary={!canStart && canOpen} text='Open' onClick={onOpenClicked} disabled={!canOpen} /></Slot>
                <Slot $order={1}><Button text='Close' onClick={onCancelClicked} /></Slot>
                <Slot $order={0} $start><Button variant='danger' text='Delete' onClick={onDeleteClicked} /></Slot>
            </Footer>
            </Dialog>
        
    )

}

export const ActivityDetailsDialog = ({onOpen,onStart})=> {

    const service = useActivityList()
    const ui = useAppUI()

    const [state,setState] = useState(null)
    const [loading,setLoading] = useState(false)
    const mountedRef = useRef() 
    const observerRef = useRef()

    const logger = new EventLogger('ActivityDetails')

    const logError = useCallback ( (err,fn,details={}) => { 
        logger.logEvent ({message:'error',fn,error:err.message,stack:err.stack,...details})
    },[logger])


    const init = useCallback( () => {
        try {
            setState( service.openSelected() )
            observerRef.current = service.getObserver()
            observerRef.current.on('updated', (update) => {
                setState(update)
            })
        }
        catch(err) {
            logError(err,'init')
        }
    },[logError, service])

    useEffect(() => {
        if (mountedRef.current)
            return;

        mountedRef.current = true
        try {
            const activity = service.getSelected()
            if (!activity)  
                return

            const loaded = activity.isComplete()
            if (!loaded) {
                setLoading(true)
                activity.load().then( () => {
                    init()
                    setLoading(false)
                })
                return
            }
            init()
        }
        catch(err) {
            logError(err,'useEffect')
        }
    },[init, logError, service])

    const onCancel = () => {
        try {
            service.closeSelected()
            setState(null)
        }
        catch(err) {
            logError(err,'onCancel')
        }
    }

    const onDelete = async ()=>{

        try {
            const activity = service.getSelected()
            service.closeSelected()

            await service.delete(activity.id)
            setState(null)
        }
        catch(err) {
            logError(err,'onDelete')
        }
    }

    const onStartHandler = async () => { 
        try {
            const {canStart,route} = await service.rideAgain()
            if (canStart  ) {
                setState(null)
                if (typeof onStart === 'function')
                    onStart(route)
            }
        }
        catch(err) {
            logError(err,'onStart')
        }

    }


    const onOpenUpload = (upload) => {
        try {
            ui.openBrowserWindow(upload.url)
        }
        catch(err) {
            logError(err,'onOpenUpload')
        }
    }

    const onOpenFile= (fileDef)=> {
        try {
            ui.showItemInFolder(fileDef.file)
        }
        catch(err) {
            logError(err,'onOpenUpload')
        }
    }

    const onExport = async (fileDef) => {
        service.export(fileDef.type)
    }

    const onUpload = async (upload) => {
        service.upload(upload.type)
    }

    if (loading) {
        const activity = service.getSelected()
        return <ActivityDetails loading title={activity.title} activity={activity}/>
    }

    if (state) 
        return <ActivityDetails {...state} 
            onCancel={onCancel} onStart={onStartHandler} onDelete={onDelete} onOpen={onOpen} 
            onExport={onExport} onOpenExport={onOpenFile}
            onUpload={onUpload} onOpenUpload={onOpenUpload} />
    
    return null;
}