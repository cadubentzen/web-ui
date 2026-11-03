import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'
import { Button, ButtonBar, ErrorBoundary } from '../../../atoms'
import { Panel } from '../../../atoms/Panel'
import { kitTokens } from '../../../../theme'
import { timeFormat } from '../../../../utils/formatting'
import { Dialog } from '../../Dialog'

// Screenshots of a ride: a strip of thumbnails; a thumbnail opens the screenshot in a viewer
// that pages through all of them. Everything is a button, so it can be driven with a controller.

const MOMENTS = { start: 'Start', effort: 'Effort', summit: 'Summit', finish: 'Finish' }

/** the screenshot's file as the app serves it */
export const screenshotUrl = (fileName) => `incyclist:///${fileName}`

/** e.g. "Summit · 30:35" - the key moment it was taken at (if any) and the ride time */
export const screenshotCaption = (screenshot) => {
    const moment = MOMENTS[screenshot?.moment]
    const time = Number.isFinite(screenshot?.time) ? timeFormat(screenshot.time, true) : undefined
    return [moment, time].filter(Boolean).join(' · ')
}

const Strip = styled(Panel)`
    flex: none;
    display: flex;
    flex-direction: column;
    gap: 0.8vh;
    padding: 1vh 1vw;
    min-width: 0;
`

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 1.8vh;
    font-weight: 600;

    & button { margin: 0; }
`

const Count = styled.span`
    margin-left: 0.6vw;
    font-weight: 400;
    color: ${props => kitTokens(props.theme).muted};
`

const Thumbnails = styled.div`
    display: flex;
    gap: 0.8vw;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 2px;       /* room for the focus ring */
`

const Thumbnail = styled.button`
    position: relative;
    flex: none;
    height: ${props => props.$height};
    aspect-ratio: 16 / 9;
    padding: 0;
    overflow: hidden;
    cursor: pointer;
    background: rgba(0,0,0,0.3);
    border: 1px solid ${props => kitTokens(props.theme).hairline};
    border-radius: 0.8vh;

    & img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }

    &:hover, &:focus-visible {
        border-color: ${props => kitTokens(props.theme).accent};
    }
`

const ThumbnailCaption = styled.span`
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 0.3vh 0.5vw;
    font-size: 1.3vh;
    text-align: left;
    color: white;
    background: linear-gradient(transparent, rgba(0,0,0,0.7));
`

const ViewerContent = styled.div`
    box-sizing: border-box;
    height: calc(100% - 7.7vh);
    padding: 0 1.4vw;
    display: flex;
    align-items: center;
    justify-content: center;

    & img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        border-radius: 0.8vh;
    }
`

const ViewerButtons = styled(ButtonBar)`
    box-sizing: border-box;
    padding: 0 1.4vw;
    gap: 0.8vw;
    & button { margin: 0; }
    & > :first-child { margin-right: auto; }
`

/**
 * One screenshot, large, with buttons to page through the others
 */
export const ScreenshotViewer = ({ screenshots, index, onChange, onClose, onShowInFolder }) => {
    const screenshot = screenshots[index]
    if (!screenshot)
        return null

    const caption = screenshotCaption(screenshot)
    const title = `Screenshot ${index + 1} of ${screenshots.length}${caption ? ` · ${caption}` : ''}`
    const hasPrev = index > 0
    const hasNext = index < screenshots.length - 1

    return (
        // closed with its ✕ - or B/Escape
        <Dialog id='ScreenshotViewer' title={title} level={11} width='90%' height='90%' onESC={onClose} onClose={onClose} log={{ count: screenshots.length }}>
            <ViewerContent>
                <img src={screenshotUrl(screenshot.fileName)} alt={caption || screenshot.fileName} />
            </ViewerContent>
            <ViewerButtons>
                {onShowInFolder ? <Button text='Show in folder' onClick={() => onShowInFolder(screenshot.fileName)} /> : <span />}
                <Button text='Previous' disabled={!hasPrev} data-nav-default={hasNext ? undefined : ''} onClick={() => onChange(index - 1)} />
                <Button text='Next' primary={hasNext} disabled={!hasNext} data-nav-default={hasNext ? '' : undefined} onClick={() => onChange(index + 1)} />
            </ViewerButtons>
        </Dialog>
    )
}

/**
 * The screenshots of a ride as a strip of thumbnails. Selecting one shows it large.
 *
 * @param {Array<{fileName:string,time?:number,moment?:string}>} screenshots
 * @param {(fileName:string)=>void} [onShowInFolder] opens the screenshot's folder (button hidden if not given)
 * @param {string} [thumbnailHeight] height of the thumbnails
 */
export const ScreenshotGalleryView = ({ screenshots, onShowInFolder, thumbnailHeight = '9vh', className }) => {
    const [selected, setSelected] = useState()
    const list = (screenshots ?? []).filter(s => !!s?.fileName)
    if (!list.length)
        return null

    return (
        <ErrorBoundary hideOnError>
            <Strip className={className} data-testid='screenshot-gallery'>
                <Header>
                    <span>Screenshots<Count>{list.length}</Count></span>
                    {onShowInFolder ? <Button size='small' text='Open folder' onClick={() => onShowInFolder(list[0].fileName)} /> : null}
                </Header>
                <Thumbnails>
                    {list.map((s, i) => {
                        const caption = screenshotCaption(s)
                        return (
                            <Thumbnail key={s.fileName} type='button' $height={thumbnailHeight}
                                aria-label={`Screenshot ${i + 1}${caption ? ` (${caption})` : ''}`}
                                onClick={() => setSelected(i)}>
                                <img src={screenshotUrl(s.fileName)} alt='' loading='lazy' />
                                {caption ? <ThumbnailCaption>{caption}</ThumbnailCaption> : null}
                            </Thumbnail>
                        )
                    })}
                </Thumbnails>
            </Strip>

            {selected !== undefined && createPortal(
                <ScreenshotViewer screenshots={list} index={selected} onChange={setSelected}
                    onClose={() => setSelected(undefined)} onShowInFolder={onShowInFolder} />,
                document.body
            )}
        </ErrorBoundary>
    )
}
