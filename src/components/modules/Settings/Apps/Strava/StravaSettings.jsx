import React, { useState } from 'react'
import { Button, Row } from "../../../../atoms"
import { AppSettingsFrame } from '../AppSettingsFrame'
import { AppThemeProvider } from '../../../../../theme'
import { EventLogger } from 'gd-eventlog'
import { hasFeature } from '../../../../../utils/electron/integration'
import { OAuthBinding} from '../../../../../bindings'
import { useAppsService } from 'incyclist-services'
import { OperationsSelector } from '../../../../molecules/Apps/OperationsSelector'

export const StravaSettings = ({onBack})=> {

    const logger = new EventLogger('StravaSettings')
    const [connecting,setConnecting] = useState(false)
    const service = useAppsService()

    const [settings,setSettings] = useState( service.openAppSettings('strava'))
    

    const onConnect = async ()=>{

        try {
            logger.logEvent({message:'onConnectStrava'})
            if (hasFeature('oauth')) {

                setConnecting(true)
                const res = await OAuthBinding.getInstance().authorize('strava');
            
                if (res.success) {
                    logger.logEvent({message:'onConnectStrava succes', username:res.user.name})
                    await service.connect('strava', res.user?.auth?.strava)                               
                    const settings = service.openAppSettings('strava')
                    setSettings( current=> ({...current, ...settings}) )
                
                    
                }
                else {
                    logger.logEvent({message:'onConnectStrava failed', reason:res.reason})
                }
                setConnecting(false)

            }
        }
        catch(err) {
            logger.logEvent({message:'error', fn:'onConnect', error:err.message, stack:err.stack})
        }
    }

    const onDisconnect = ()=>{
        service.disconnect('strava')
        setSettings( {isConnected:false})
    }

    const onOperationsChanged = (operation, enabled) => {
        const operations = service.enableOperation('strava',operation,enabled,true )
        setSettings( current=> ({...current,operations} ))        
    }

    return <StravaSettingsView {...settings} isConnecting={connecting} 
        onBack={onBack} 
        onConnect={onConnect} onDisconnect={onDisconnect} 
        onOperationsChanged={onOperationsChanged}
        />


}

export const StravaSettingsView = ( {isConnected, isConnecting, operations, onBack, onConnect, onDisconnect,onOperationsChanged}) => {

    return <AppThemeProvider>
        <AppSettingsFrame title='Strava Settings' onBack={onBack}>

            <Row className='buttons'>
                {isConnected ?  
                    <div>
                        <Button secondary={true} text={'Disconnect from Strava'} onClick={onDisconnect}></Button> 
                    </div>
                : 
                    <div>
                        <Button disabled={isConnecting} variant='text' padding={0} noBorder onClick={onConnect}
                            id='Connect With Strava'
                            >
                            <img src='images/btn_strava_connectwith_orange.svg' alt='Connect With Strava'></img>
                        </Button> 
                    </div>        
                }
            </Row>

            {isConnected ? <Row className='options'>
                <OperationsSelector operations={operations} onChanged={onOperationsChanged}/>

            </Row>:null}
        </AppSettingsFrame>
    </AppThemeProvider>

}