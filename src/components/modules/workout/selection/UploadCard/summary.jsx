import React from 'react';
import { AppThemeProvider } from '../../../../../theme';
import { Container, DataContainer, Title } from '../base/atoms';
import styled from 'styled-components';
import { Dropzone } from '../../../../molecules';

const FileDrop = styled(Dropzone)`
    box-sizing: border-box;
    flex: 1;
    min-height: 0;
    width: 100%;
    margin: 0;
`

const DEFAULT_TITLE = 'Import Workout'
const DEFAULT_FILTERS = [
    { name: 'Workouts', extensions: ['zwo'] }
]

export const UploadSummary = ( { id, title=DEFAULT_TITLE, filters=DEFAULT_FILTERS, onOK }) => {

    const onDrop = async (...args)=>{
        if (onOK) {
            await onOK(...args)
        }
        return null;
    }

    return (
        <AppThemeProvider>
        <Container className='workout-card'>
            <DataContainer>
                <Title title={title}>{title}</Title>
                <FileDrop glass height='100%' filters={filters} onDrop={onDrop} />
            </DataContainer>
        </Container>
        </AppThemeProvider>
    )
}
