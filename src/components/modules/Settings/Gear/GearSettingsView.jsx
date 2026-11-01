import React from 'react';
import styled from 'styled-components';
import { Property, PropertyGrid, Select, Label } from '../../../molecules/Settings';
import { SettingsContent, SectionHeader } from '../layout';
import { EventLogger } from 'gd-eventlog';
import { AppThemeProvider, kitTokens } from '../../../../theme';


const Description = styled.div`
    font-size: 0.8em;
    color: ${props => kitTokens(props.theme).muted};
`

export class GearSettingsView extends React.Component {

    constructor(props){
        super(props)

        this.logger = props?.logger || new EventLogger('Setting');
        this.virtShiftInfoShown = false

    }

    onChangeMode(mode) {    
        try {    
            this.logger.logEvent( {message: 'list item selected',list:'mode',option: mode, eventSource:'user'})

            if (this.props.onChangeMode)
                this.props.onChangeMode(mode)
        }
        catch(err) {
            this.logger.logEvent( {message: 'error',fn:'onChangeMode', error:err.message, stack:err.stack})
        }
    }

    onSettingsChanged(property,value) {
        try {
            if (this.props.onChangeSetting)
                this.props.onChangeSetting(property,value)
        }
        catch(err) {
            this.logger.logEvent( {message: 'error',fn:'onChangeMode', error:err.message, stack:err.stack})
        }
    }

    render() {
        const {disabled, mode, options=[],settings,logger} = this.props??{};
        
        const selected = mode
        const selectedMode = options?.find( o=> o?.getName()===selected)
        const properties = selectedMode?.getProperties() ?? [];

        try {
            const virtShift = properties?.find( p=> p.key==='virtshift')
            if (virtShift && !this.virtShiftInfoShown) {
                this.logger.logEvent({message:'Virtual Shifting options: ',virtshiftOpts: virtShift.options.map(o=>o.key??o).join(',')})
                this.virtShiftInfoShown = true
                
            }
        }
        catch {}
        
        if (disabled || !mode ) 
            return null;
        
        return(
            <AppThemeProvider>
            <SettingsContent>
                <SectionHeader>Bike Preference</SectionHeader>
                <PropertyGrid>
                    <Label>Mode</Label>
                    <div>
                        <Select name='mode' id='mode' aria-label='Mode' value={selected} onChange={ (e)=>this.onChangeMode(e.target.value)} > 
                        {options.map( (o,index) => 
                            <option key={index} value={o?.getName()} label={o?.getName()} />
                        )}
                        </Select>
                        {selectedMode?.getDescription() ? <Description>{selectedMode.getDescription()}</Description> : null}
                    </div>

                    {properties.map( (p,index) => 
                        <Property key={index} property={p} noLog logger={logger} value={(settings? settings[p.key]:undefined) || p.default} settings={settings} onChange={ (p,value) => this.onSettingsChanged(p,value)} />
                    )}
                </PropertyGrid>
            </SettingsContent>
            </AppThemeProvider>
        )
    }
}

