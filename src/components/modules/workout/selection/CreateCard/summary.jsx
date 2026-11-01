import React from 'react';
import { AppThemeProvider } from '../../../../../theme';
import { Actions, Container, DataContainer, Footer, ImageContainer, Title } from '../base/atoms';
import { Button, Image, Row } from '../../../../atoms';

const DEFAULT_TITLE = 'Create Workout'

export const CreateSummary = ( { id, title=DEFAULT_TITLE, onOK }) => {

    return (
        <AppThemeProvider>
        <Container className='workout-card'>

            <ImageContainer>
                <Row align='center' justify='center' background='white' height='100%'>
                        <Image width='80%'  src='images/zwofactory.svg'/>
                </Row>
            </ImageContainer>

            <DataContainer>
                <Title title={title}>{title}</Title>
                <Footer>
                    <span/>
                    <Actions>
                        <Button text='Create' primary={true} size='small' margin='0' disabled={false} logContext={ {title}} onClick={onOK} />
                    </Actions>
                </Footer>
            </DataContainer>

        </Container>
        </AppThemeProvider>
    )
}
