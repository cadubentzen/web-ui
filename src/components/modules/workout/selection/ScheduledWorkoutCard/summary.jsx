import React from 'react';
import { AppThemeProvider } from '../../../../../theme';
import { Button, Loader, Row } from '../../../../atoms';
import { WorkoutGraph } from '../../../../molecules';
import { Actions, Container, DataContainer, Footer, ImageContainer, LoaderContainer, Subtitle, Title } from '../base/atoms';

export const ScheduledWorkoutSummary = ( props) => {
  
    const { visible,title=props?.workout?.title,workout,ftp=200,duration,selected, date,
            width='20vw',height='30vh',onOK,onUnselect} = props
    
    const showDuration = duration!==undefined && duration!==null && typeof(duration)==='string'
    const titleStr = title!==undefined && title!==null && typeof(title)==='string' ? title : ''

    const showDate = !!date
    const dateStr = showDate ? date.toLocaleDateString() : ''

    const showFtp = typeof(props.ftp)==='number'
    const subtitle = [showDuration ? duration : null, showDate ? dateStr : null].filter(Boolean).join(' · ')

    return (
        <AppThemeProvider>
        <Container hidden={!visible} $selected={selected} className='workout-card'>

            <ImageContainer>
                { workout?
                        <Row width='100%' height='100%'>
                            <WorkoutGraph  workout={workout}  dashboard ftp={ftp}/>
                        </Row>
                    :null}
                {!workout ? <LoaderContainer><Loader/></LoaderContainer>: null}
            </ImageContainer>

            <DataContainer className='data'>
                <div>
                    <Title title={titleStr}>{titleStr}</Title>
                    {subtitle ? <Subtitle>{subtitle}</Subtitle> : null}
                </div>
                <Footer>
                    <span>{showFtp ? `FTP ${ftp} W` : null}</span>
                    <Actions>
                        {selected ?
                            <Button text='Unselect' size='small' margin='0' disabled={!workout} logContext={ {title}} onClick={onUnselect}/> :
                            <Button text='Select' primary={true} size='small' margin='0' disabled={!workout} logContext={ {title}} onClick={onOK} />
                        }
                    </Actions>
                </Footer>
            </DataContainer>

        </Container>
        </AppThemeProvider>
    )
}
