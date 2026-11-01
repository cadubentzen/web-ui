import React, { useEffect, useRef, useState } from 'react';
import MainPage from '../../components/molecules/MainPage';
import {PageTitle} from '../../components/atoms/Title';
import styled from 'styled-components';
import { SearchingDevice, SelectedDevice } from '../../components/modules/PairingInfo';
import {InterfaceInfo}  from '../../components/modules/PairingInfo/InterfaceSettings/interface-info';
import { Button } from '../../components/atoms/Buttons/Button';
import { kitTokens } from '../../theme';

const StatusLine = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.8vh;
    color: ${props => kitTokens(props.theme).muted};
    text-align: center;
    margin-top: 1vh;
`

const StatusDot = styled.span`
    display: inline-block;
    width: 1.1vh;
    height: 1.1vh;
    border-radius: 50%;
    margin-right: 0.6vw;
    background: ${props => {
        const kit = kitTokens(props.theme)
        return props.$color==='red' ? kit.danger : props.$color==='green' ? kit.ok : kit.accent
    }};
`

// a row of tiles with its label on the left
const Group = styled.div`
    display: grid;
    grid-template-columns: 11vw 1fr;
    gap: 1.5vw;
    align-items: start;
    padding: 0 4vw;
    margin-top: 3vh;
`

const Tiles = styled.div`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.1vw;
`

const RowLabel = styled.div`
    color: white;
    padding-top: 1vh;
    >div:first-child {
        font-size: 2.4vh;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.04em;
    }
    >div:last-child {
        font-size: 1.8vh;
        color: ${props => kitTokens(props.theme).muted};
    }
`

const Buttons = styled.div`
    position: absolute;
    width:100%;
    height: 10vh;
    bottom: 0px;
    min-height: 10vh;
    max-height: 10vh;
    display: flex;
    flex-direction: row;
    justify-content: center;
`

const Interfaces = styled.div`
    position: absolute;
    bottom: 2vh;
    left: 1.5vw;
    display: flex;
    gap: 0.5vw;
`

// Purely a renderer of the page service's display props: tile order/role, row labels, status and
// button layout all come from `capabilities`/`status`/`buttons` - nothing is derived here beyond
// what depends on the page's own size (the resize listener) and the "waiting" ring, which mirrors
// mobile's CapabilityGrid (computed from role/readyToStart/noSearch, not sent over the wire). Tile
// and interface clicks call each item's own bound `onClick` (the service already logs them), the
// same way a selected tile's onUnselect/onUse come straight from its own props.
export const PairingScreen = ( {capabilities,interfaces,connectRetry, readyToStart,status, buttons}) => {

    const ref = useRef(null);

    const [,setWidth] = useState()
    const [,setHeight] = useState()

    useEffect(() => {
        const div = ref.current;
        if (div) {
            window.addEventListener("resize", onResize);
        }
        onResize()
    })

    const top = capabilities?.top ?? []
    const bottom = capabilities?.bottom ?? []
    const rowLabels = capabilities?.rowLabels
    const noSearch = status?.id === 'S1'

    const onResize = () =>  {
        setWidth(window.innerWidth)
        setHeight(window.innerHeight)

    }

    const renderTile = (c,idx) => {
        const waiting = c.role==='required' && !readyToStart && !noSearch && !c.disabled
        return c.deviceName ?
            <SelectedDevice key={idx} title={c.title} capability={c.capability} deviceName={c.deviceName} connectState={c.connectState} value={c.value} unit={c.unit} disabled={c.disabled} footer={c.emptyFooter}  onClick={c.onClick} onUnselect={c.onUnselect} onUse={c.onUse} /> :
            <SearchingDevice key={idx} title={c.title} capability={c.capability} waiting={waiting} helpText={c.helpText?.full} footer={c.emptyFooter}  onClick={c.onClick} />
    }

    return (
        <MainPage className='main'>
            <PageTitle>Devices</PageTitle>
            {status ?
                <StatusLine>
                    <StatusDot $color={status.dot} />
                    <span>{status.text}</span>
                </StatusLine>
            : null}
            <Group className='top'>
                <RowLabel>
                    <div>{rowLabels?.top?.text}</div>
                    {rowLabels?.top?.subtext ? <div>{rowLabels.top.subtext}</div> : null}
                </RowLabel>
                <Tiles>{top.map(renderTile)}</Tiles>
            </Group>
            <Group className='bottom' data-nav-down='.pairing-buttons button'>
                <RowLabel>
                    <div>{rowLabels?.bottom?.text}</div>
                    {rowLabels?.bottom?.subtext ? <div>{rowLabels.bottom.subtext}</div> : null}
                </RowLabel>
                <Tiles>{bottom.map(renderTile)}</Tiles>
            </Group>
            {buttons?.length ?
                <Buttons className='pairing-buttons'>
                    {buttons.map( (b,idx)=> <Button key={idx} height={'6vh'} primary={b.primary} text={b.label} onClick={b.onClick} />)}
                </Buttons>
            : null}
            {interfaces?.length ?
                <Interfaces>
                    { interfaces.map( (info,idx)=>
                        <InterfaceInfo
                            name={info.name} connectRetry={connectRetry} isScanning={info.isScanning} enabled={info.enabled} protocol={info.protocol} ifState={info.state} key={idx}
                                        onClick={info.onClick}
                                    />
                                )}
                </Interfaces>
                :null}

        </MainPage>
    )

}
