import React from 'react'
import styled from 'styled-components'
import { ArrowLeftIcon } from '@primer/octicons-react'
import { Button, Row } from '../../../atoms'
import { SettingsContent, SectionHeader } from '../layout'

const Header = styled(Row)`
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1vh;
`

/** Page frame of one app's settings: section title, a pill "back to Apps" button and the content */
export const AppSettingsFrame = ({ title, onBack, children }) => (
    <SettingsContent>
        <Header>
            <SectionHeader className='title' style={{ margin: 0 }}>{title}</SectionHeader>
            <Button className='back' size='small' secondary={true} padding='0 1em' margin='0' onClick={onBack}>
                <ArrowLeftIcon size={16} /> Apps
            </Button>
        </Header>
        {children}
    </SettingsContent>
)
