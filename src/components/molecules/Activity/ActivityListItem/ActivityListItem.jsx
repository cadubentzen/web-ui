import React, { useEffect, useRef, useState } from 'react';
import { AppThemeProvider } from '../../../../theme';
import { Container, DeleteSlot, Identity, ImageContainer, Meta, Stat, StatLabel, Stats, StatValue, Title } from './atoms';
import { ActivityPreview } from '../ActivityPreview';
import { Dynamic } from '../../../atoms/Dynamic';
import { Button } from '../../../atoms';
import { TrashIcon } from '@primer/octicons-react';
import { formatDateTime, useActivityList, useUserSettings } from 'incyclist-services';
import styled from 'styled-components';
import { useCallback } from 'react';

const OutsideFold = styled(Container)`
    opacity: 0.1;
`

const TitleElement = ({text}) => <Title>{text}</Title>
const StatText = ({text}) => <StatValue>{text}</StatValue>

export const ActivityListItem = ({ onClick,onDelete, activityInfo, outsideFold}) => { 


    const initialized = useRef(false)
    const [observer,setObserver] = useState(null)
    const service = useActivityList()
    const userSettings = useUserSettings()

    const {id,distance: rideDistance,startTime,rideTime,totalElevation:summaryElavation} = activityInfo?.summary??{}
    const {logs,totalElevation:detailsElevation} = activityInfo?.details??{}
    const totalElevation = summaryElavation??detailsElevation
    

    const onDeleteHandler = (event) => {
        
        event.stopPropagation();
        if (typeof (onDelete)==='function')
            onDelete()
    }
 
    const getFtp = ()=>{
        try {
            return userSettings.get('user')?.ftp??200
        }
        catch{
            return 200
        }
    }

    const getDetails = useCallback( (id) =>{
        try {
            return service.getActivityDetails(id)        
        }
        catch(err) {
            console.log('~~~ ERROR',err, service)
            return null;
        }
    },[service])

    const getTitle = (d) => {
        const {summary} = activityInfo??{}
        const details = d ?? activityInfo?.details
        if (summary?.title!=='Incyclist Ride')
            return summary?.title
        return details?.route?.title??details?.route?.name??'Incyclist Ride'         
    }

    const getDateTime = () => {
        let time = ''
        let date = ''
        if (startTime) {
            const start = new Date(startTime)
            time = formatDateTime(start,'%H:%M')
            date = formatDateTime(start,'%d.%m.%Y')
        }
        return {date,time}
    }
    const getDuration= ()=>{
        let duration = ''
        if (rideTime) {
            const hours = Math.floor(rideTime / 3600)
            const minutes = Math.floor((rideTime % 3600) / 60)
            if (hours > 0)
                duration = `${hours}h ${minutes}min`
            else
                duration = `${minutes}min`
        }
        return duration
    }

    const formatted = (v) => {
        const {value,unit} = v
        return `${value}${unit}`
    }

    const getElevationText = (details)=>{
        try {
            const elevation = details ? details.totalElevation : totalElevation
            if (elevation==undefined)
                return ''

            if (typeof elevation === 'number')
                return elevation && !isNaN(elevation) ? `${(elevation).toFixed(0)}m ` : '';

            if (elevation.value!==undefined && elevation.unit) {
                return formatted(elevation)
            }
        }
        catch {}
        return ''

    }

    const getDistanceText = () => {
        try {
            if (rideDistance===undefined || rideDistance===null)
                return ''

            if (typeof rideDistance === 'number')
                return rideDistance && !isNaN(rideDistance) ? `${(rideDistance / 1000).toFixed(1)}km ` : '';        
            if (rideDistance.value!==undefined && rideDistance.unit) {
                return formatted(rideDistance)
            }

        }
        catch {}
        return ''
    }

                                    
    const onContainerClicked = (e) =>{        
        if (onClick)
            onClick(id)
    }

    useEffect( ()=> {
        if (initialized.current)
            return

        if (!logs && !outsideFold) {
            if (id!==undefined) {
                setObserver( getDetails(id))
            }
        }
        initialized.current = !outsideFold
    },[getDetails, id, logs, outsideFold])

    // reduce rendering time when commponent is not visible (below fold), just reserve required space
    if (outsideFold) {
        return (
            <AppThemeProvider>
                <OutsideFold onClick={ onContainerClicked}></OutsideFold>        
            </AppThemeProvider>
        )
    }

    if (!activityInfo || !activityInfo.summary) 
        return null


    const title = getTitle()
    const {date,time} = getDateTime()
    const duration = getDuration()
    const distanceText = getDistanceText()
    const elevationText = getElevationText()
    const ftp = getFtp()
    

    return (
        <AppThemeProvider>
            <Container tabIndex={0} aria-label={title} onClick={ onContainerClicked}>
                <ImageContainer>
                        <Dynamic observer={observer} events={'loaded,updated'} prop='activity' >
                            <ActivityPreview activity={ activityInfo?.details } ftp={ftp}/>
                        </Dynamic> 
                </ImageContainer>

                <Identity>
                    <Dynamic observer={observer} events={'loaded,updated'} prop='text' transform={getTitle} >
                        <TitleElement text={title}/>
                    </Dynamic> 
                    <Meta>{[date,time,duration].filter(v=>!!v).join('  ·  ')}</Meta>
                </Identity>

                <Stats>
                    <Stat>
                        <StatValue>{distanceText}</StatValue>
                        <StatLabel>Distance</StatLabel>
                    </Stat>
                    <Stat>
                        <Dynamic observer={observer} events='loaded,updated' transform={getElevationText} prop='text'>
                            <StatText text={elevationText} />
                        </Dynamic>
                        <StatLabel>Elevation</StatLabel>
                    </Stat>
                </Stats>

                <DeleteSlot>
                    <Button variant='text' id='delete' size='small' margin='0' padding='0.4em' width='4.4vh' height='4.4vh'
                        aria-label='Delete' logContext={{id,title}} onClick={onDeleteHandler}>
                        <TrashIcon verticalAlign='middle' />
                    </Button>
                </DeleteSlot>
            </Container>        
        </AppThemeProvider>
    )
}
