import React, { useState } from 'react'
import { Button, Row } from "../../../../atoms"
import { AppSettingsFrame } from '../AppSettingsFrame'
import { AppThemeProvider } from '../../../../../theme'
import { EventLogger } from 'gd-eventlog'
import { hasFeature } from '../../../../../utils/electron/integration'
import { OAuthBinding } from '../../../../../bindings'

import { useAppsService } from 'incyclist-services'
import { OperationsSelector } from '../../../../molecules/Apps/OperationsSelector'

export const IntervalsSettings = ({onBack})=> {

    const logger = new EventLogger('IntervalsSettings')
    const [connecting,setConnecting] = useState(false)
    const service = useAppsService()

    const [settings,setSettings] = useState( service.openAppSettings('intervals'))
    

    const onConnect = async ()=>{

        logger.logEvent({message:'onConnectIntervals'})
        if (hasFeature('oauth')) {

            setConnecting(true)
            const res = await OAuthBinding.getInstance().authorize('intervals');
          
            if (res.success) {
                logger.logEvent({message:'onConnectIntervals succes', username:res.user.name})
                await service.connect('intervals', res.user?.auth?.intervals)                               
                const settings = service.openAppSettings('intervals')
                setSettings( current=> ({...current, ...settings}) )
            
                 
            }
            else {
                logger.logEvent({message:'onConnectIntervals failed', reason:res.reason})
            }
            setConnecting(false)

        }
    }

    const onDisconnect = ()=>{
        service.disconnect('intervals')
        setSettings( {isConnected:false})
    }

    const onOperationsChanged = (operation, enabled) => {
        const operations = service.enableOperation('intervals',operation,enabled,true)
        setSettings( current=> ({...current,operations} ))
    }

    return <IntervalsSettingsView {...settings} isConnecting={connecting} 
        onBack={onBack} 
        onConnect={onConnect} onDisconnect={onDisconnect} 
        onOperationsChanged={onOperationsChanged}
        />


}

export const IntervalsSettingsView = ( {isConnected, isConnecting, operations, onBack, onConnect, onDisconnect,onOperationsChanged}) => {

    return <AppThemeProvider>
        <AppSettingsFrame title='Intervals.icu Settings' onBack={onBack}>

            <Row className='buttons'>
                {isConnected ?  
                    <div>
                        <Button secondary={true} text={'Disconnect from Intervals.icu'} onClick={onDisconnect}></Button> 
                    </div>
                : 
                    <div>
                        <Button primary={true} text='Connect With Intervals.icu' disabled={isConnecting}
                            onClick={onConnect}/>                        
                    </div>        
                }
            </Row>

            {isConnected ? <Row className='options'>
                <OperationsSelector operations={operations} onChanged={onOperationsChanged}/>

            </Row>:null}
        </AppSettingsFrame>
    </AppThemeProvider>

}