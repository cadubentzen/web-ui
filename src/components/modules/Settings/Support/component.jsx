import React, { useState } from "react"
import { Text, Row, UrlLink, Column, Button } from "../../../atoms"
import styled from "styled-components"
import { kitTokens } from "../../../../theme"
import { SettingsContent, SectionHeader } from "../layout"

const View = styled(SettingsContent)`
    a { color: ${props => kitTokens(props.theme).accent}; }
`

const Disclaimer = styled(Row)`
    margin-top: 1.5vh;
    font-size: 1.4vh;
    color: ${props => kitTokens(props.theme).muted};
`

const Section = styled(Column)`
    margin-bottom: 1vh;
`

export const SupportAreaView = ({uuid, reactVersion, appVersion}) => {
    
    const [copied,setCopied] = useState(false)

    const textProps = {
        labelWidth:'12vw'
    }
    const copyUUID = ()=>{
        try {
            navigator.clipboard.writeText(uuid);
            setCopied(true)
        }
        catch{}
    }
    return (
        <View className='support'>
            <SectionHeader>App Info</SectionHeader>
            <Section>
                <Text label='App Version' {...textProps}>{appVersion}</Text>
                <Text label='UI Version' {...textProps}>{reactVersion}</Text>
                <Row>
                    <Text label='uuid' {...textProps}>{uuid}</Text> 
                    {!copied ? <Button size='small' secondary={true} padding='0 1em' margin='0 0 0 0.5vw' onClick={copyUUID}>Copy</Button>: null}
                </Row>
                <Text label='Privacy' {...textProps}><UrlLink text='Privacy Statement' url='https://incyclist.com/privacy'/></Text>
            </Section>
            
            <SectionHeader>Where can I get support?</SectionHeader>
            <Section>
                <Text label='Slack' {...textProps}><UrlLink text='Incyclist Slack Workspace' url='https://join.slack.com/t/incyclist/shared_invite/zt-119wcvtjn-uiZ_Pw6gh5WLc0zT8jkfTg'/></Text>
                <Text label='Strava' {...textProps}><UrlLink text='Incyclist Strava Club' url='https://www.strava.com/clubs/1029407'/></Text>
                <Text label='Email' {...textProps}><UrlLink text='support@incyclist.com' url='mailto:support@incyclist.com'/></Text>
            </Section>
            
            <SectionHeader>How can I support?</SectionHeader>
            <Section>
                <Text label='Coding' {...textProps}>Incyclist is open source. You can contribute to the development in my <UrlLink text='GitHub' url='https://github.com/incyclist'/></Text>
                <Text label='Donation' {...textProps}>You can donate any amount to <UrlLink text='Incyclist Paypal' url='https://www.paypal.com/paypalme/incyclist'/></Text>
            </Section>
            <Disclaimer>                
                <Text>
                    Donation is 100% voluntarily. In case you donate, you will not have any benefit within the App. I.e. Incyclist remains to be a 100% free app, regardless if you donate or not. 
                    I am also <b>not</b> planning to introduce a freemium model, where certain functionality is only available for paying users.
                </Text>
            </Disclaimer>
                    
        </View>
    )

}
