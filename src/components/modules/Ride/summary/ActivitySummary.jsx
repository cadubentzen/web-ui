/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { Button, ErrorBoundary, Image, UrlLink  } from "../../../atoms"
import { Panel } from "../../../atoms/Panel"
import { AppThemeProvider } from "../../../../theme"
import styled from "styled-components";
import { FreeMap } from "../../../molecules/Maps";
import { ActivityGraph,ActivityStats,ScreenshotPopup } from "../../../molecules/Activity";
import { MessageBox } from "../../../molecules";
import { SummaryTiles } from "./SummaryTiles";

import { Marker } from "react-leaflet";
import L, { icon } from 'leaflet';
import Loader from "react-spinners/ClipLoader";

// Pause menu, Activity tab (app/pause.png): summary tiles, the power trace, then the title/stats and
// the map; footer with Delete set apart on the left and the other actions on the right.
export const ContentArea = styled.div`
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: calc(100% - 1vh);
    display: flex;
    flex-direction: column;
    text-align: left;
    padding: 1vh 1.4vw 0;
`;

export const DataArea = styled.div`
    position: relative;
    flex: 1 1 auto;
    min-height: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1.4vh;
    font-size: 1.7vh;
`

const GraphPanel = styled(Panel)`
    flex: 4 1 0;
    min-height: 0;
    padding: 1.2vh 1vw;
    display: flex;
    flex-direction: column;
`

const GraphSlot = styled.div`
    flex: 1 1 auto;
    min-height: 0;
    position: relative;
`

const DetailsRow = styled.div`
    flex: 5 1 0;
    min-height: 0;
    display: flex;
    gap: 1vw;
`

const MapPanel = styled(Panel)`
    flex: 54 1 0;
    min-width: 0;
    overflow: hidden;
    position: relative;
`

const StatsPanel = styled(Panel)`
    flex: 46 1 0;
    min-width: 0;
    overflow-y: auto;
    padding: 0.4vh 1vw 1vh;
`

const DonateRow = styled(Panel)`
    flex: none;
    display: flex;
    align-items: center;
    gap: 1vw;
    padding: 0.8vh 1vw;
    font-size: 1.5vh;
`

// Delete is set apart on the left; the other actions are right-aligned, the primary one last
const Footer = styled.div`
    flex: none;
    height: 7.7vh;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.8vw;

    & button { margin: 0; }
`

const FooterGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 0.8vw;
`

const DEFAULT_DONATE_TEXT = 'You seem to be enjoying Incyclist. Please consider donating to support this app.'
const DEFAULT_DONATE_URL = 'https://www.paypal.com/paypalme/incyclist'

export const ActivitySummaryView = ( {activity,position,preview, units, xScale,
                                  showMap,showSave,showNew=true,showContinue=true,showExit=true,showDelete:showDeleteProp,
                                  isSaving=false,showDeleteConfirm=false,
                                  showDonate,donateText=DEFAULT_DONATE_TEXT,donateUrl=DEFAULT_DONATE_URL,onDonateClicked,
                                  onTitleChange, onSave, onNew, onContinue, onExit, onDelete, onDeleteConfirm, onDeleteCancel
                                 }) => {

    const [markerSize, setMarkerSize] = useState()

    // delete button shown if specified by props, otherwise fallback to always show when save is shown
    const showDelete = showDeleteProp??showSave

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

    const hasMap = showMap || !!preview

    return <ErrorBoundary> 
        <AppThemeProvider>
            <ContentArea>
                <DataArea>
                    <SummaryTiles activity={activity} />

                    <GraphPanel className='activity-graph'>
                        <ErrorBoundary>
                            <GraphSlot>
                                <ActivityGraph activity={activity} units={units} xScale={xScale} />
                            </GraphSlot>
                        </ErrorBoundary>
                    </GraphPanel>

                    <DetailsRow className='activity-stats'>
                        { hasMap ? 
                            <MapPanel>
                                { showMap ? <FreeMap
                                    activity={activity}
                                    options={[]}
                                    marker={position}
                                    onViewportChanged={onViewportChanged }>

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
                                : null}

                                { !showMap && preview ? <Image width='100%' height='100%' src={preview}/> : null }
                            </MapPanel>
                        : null}

                        <StatsPanel>
                            <ErrorBoundary>
                                <ActivityStats activity={activity} onTitleChange={onTitleChange}/>
                            </ErrorBoundary>
                        </StatsPanel>
                    </DetailsRow>

                    { showDonate && donateText ? 
                        <ErrorBoundary>
                            <DonateRow>
                                <span role='img' aria-label='info'>ℹ️</span>
                                <span>{donateText} Click <UrlLink text='here' url={donateUrl} onOpened={onDonateClicked}/> to donate</span>
                            </DonateRow> 
                        </ErrorBoundary>                            
                        : null
                    }
                </DataArea>

                <Footer>
                    <FooterGroup data-testid='footer-start'>
                        {showSave && showDelete && <Button variant='danger' text='Delete' onClick={onDelete} />}
                    </FooterGroup>
                    <FooterGroup data-testid='footer-end'>
                        {showSave && <Button primary={!showContinue} text={isSaving ? '' : 'Save'} disabled={isSaving} onClick={onSave}>{isSaving && <Loader size='2.2vh'/>}</Button>}
                        {showSave && showContinue && <Button primary={true} text='Continue' onClick={onContinue} />}
                        {!showSave && showExit && <Button text='Exit App' onClick={onExit} />}
                        {!showSave && showNew && <Button primary={true} text='New Ride' disabled={isSaving} onClick={onNew} />}
                    </FooterGroup>
                </Footer>
            </ContentArea>

            {showDeleteConfirm && createPortal(
                <MessageBox
                    title='Delete Ride'
                    text='This will permanently delete this ride. Are you sure?'
                    defaultButton='No'
                    center
                    destructive
                    onYes={onDeleteConfirm}
                    onNo={onDeleteCancel}
                />,
                document.body
            )}
        </AppThemeProvider>
    </ErrorBoundary>
}