import React from 'react'
import { EventLogger } from 'gd-eventlog'
import { useAppUI } from '../../../../bindings/native-ui'
import { ScreenshotGalleryView } from './ScreenshotGalleryView'

/**
 * The screenshots of a ride, with "Show in folder" opening the folder they are kept in
 */
export const ScreenshotGallery = (props) => {
    const app = useAppUI()

    const onShowInFolder = (fileName) => {
        new EventLogger('ScreenshotGallery').logEvent({ message: 'button clicked', button: 'Show in folder', eventSource: 'user' })
        app.showItemInFolder(fileName)
    }

    return <ScreenshotGalleryView {...props} onShowInFolder={onShowInFolder} />
}
