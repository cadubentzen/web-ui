import { useAppsService } from "incyclist-services"
import React,{ useEffect, useState } from "react"
import { SettingsContent, SectionHeader } from "../layout";
import { AppThemeProvider } from "../../../../theme";
import { Row  } from "../../../atoms";
import { AppsItem } from "../../../molecules/Apps/AppsItem";
import { StravaSettings } from "./Strava";
import { KomootSettings } from "./Komoot/KomootSettings";
import {IntervalsSettings} from './Intervals/IntervalsSettings'


export const ContentArea = SettingsContent

const getMapping = (service) => {
    const mapping = {
        strava: StravaSettings,
        komoot: KomootSettings,
        intervals: IntervalsSettings
    }
    const C = mapping[service]
    return C
}

const SettingsPage = ( {service,onBack} ) => {

    const C = getMapping(service)
    if (!C)
        return null

    return <C onBack={onBack}/>

}


export const AppsSettings = ( ) => {
    const service = useAppsService()
    const [state,setState] = useState(null)

    useEffect( ()=>{
        if (state?.initialized)
            return;

        const apps = service.openSettings()
        

        setState({apps, initialized:true})
    },[service, state])

    const onClick=(key) => {
        setState( current=> ({...current, selected:key}) )
    }

    const onBack=()=>{
        setState( current=> ({...current, selected:null}) )
    }

    if (!state?.initialized )
        return null;

    if (state.selected && getMapping(state.selected))
        return <SettingsPage service={state.selected} onBack={onBack}/>
    
    return <AppsSettingsView apps={state.apps} onClick={onClick}/>
    


}

export const AppsSettingsView = ({apps,onClick}) => {

    const onClickHandler = (name) => {
        if (onClick && typeof onClick==='function') {
            onClick(name)
        }
    }
    
    return (
        <AppThemeProvider>
            <ContentArea>
                <SectionHeader>Connect your accounts</SectionHeader>
                { apps?.length ? 
                    <Row style={{flexWrap:'wrap'}}>
                        {apps.map( (app) => <AppsItem key={app.key} {...app} onClick={()=>onClickHandler(app.key)} />)}
                    </Row> :
                    <Row>No Apps available</Row>
                }

            </ContentArea>
        </AppThemeProvider>
    )
    
}