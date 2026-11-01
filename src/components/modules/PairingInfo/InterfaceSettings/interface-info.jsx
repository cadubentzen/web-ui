import React from 'react';
import styled from 'styled-components';
import BounceLoader from 'react-spinners/BounceLoader'
import ClipLoader from 'react-spinners/ClipLoader'
import { useDeviceAccess } from 'incyclist-services';
import { sleep } from '../../../../utils/coding';
import { kitTokens } from '../../../../theme';


// small pill: outline shows the interface state (ok / danger / accent), muted outline when disabled
const Btn = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 0.4vw;
    margin: 0;
    padding: 0.3em 0.9em;
    background: transparent;
    border: none;
    border-radius: 999px;
    cursor: ${props => props.$unavailable ? 'default' : 'pointer'};
    font-family: inherit;
    font-size: 1.5vh;
    white-space: nowrap;
    color: ${props => props.$outline ? 'white' : kitTokens(props.theme).muted};
    box-shadow: inset 0 0 0 1px ${props => kitTokens(props.theme)[props.$outline] ?? kitTokens(props.theme).pillOutline};
    opacity: ${props => props.$unavailable ? 0.5 : 1};
    transition: background 0.2s;
    &:hover { background: ${props => props.$unavailable ? 'transparent' : kitTokens(props.theme).pillHover}; }
`

const Texts = {
    serial: 'Serial',
    ant: 'Ant+',
    ble: 'BLE',
    tcpip: 'TCP',
    wifi:  'Wifi'
}

export default class InterfaceInfoWrapper  extends React.PureComponent{

    constructor (props) {
        super(props);

        this.state = {
            ifState: 'unknown',
            scanState: props.scanState,
        }
        this.deviceAccess = null;

        this.interfaceChangedHandler = this.onInterfaceChanged.bind(this)
        this.scanStateChangeHandler = this.onScanStateChanged.bind(this)
    }

    initServices() {
        const {name,connectRetry} = this.props;

        if (!this.deviceAccess) {
            this.deviceAccess = useDeviceAccess()
        
            // Device Access Service Events
            this.deviceAccess.on('interface-changed',this.interfaceChangedHandler)        
            this.deviceAccess.on('scanstate-changed',this.scanStateChangeHandler)        
            
        }

        const info = this.deviceAccess?.getInterfaceInfo(name)   
        
        if (info) {
            if (info.state!=='connected' && connectRetry)
                this.iv = setInterval(() => { this.autoConnect() }, 2000);
            
            this.setState({ifState:info.state} )            
        }
        else {
            this.setState({ifState:'unavailable'} )            
        }
        
        
    }

    componentDidMount() {
        this.initServices()

        if (this.state && !this.iv) {
            this.initServices()
        }

    }

    componentWillUnmount() {
        if (this.iv) {
            clearInterval(this.iv)
            this.iv = null;
        }
        this.deviceAccess.off('interface-changed',this.interfaceChangedHandler)        
        this.deviceAccess.off('scanstate-changed',this.scanStateChangeHandler)        
}

    
    autoConnect() {
        const {state} = this.state        
        const  {enabled,name} = this.props

        if (!enabled)
            return
        if ( !state || state==='unknown' || state==='disconnected') {
            const info = this.deviceAccess.getInterfaceInfo(name)
            if (info.state!=='connected' && info.state!=='connecting')
                this.deviceAccess.connect(name).catch()
        }
    }

    async onInterfaceChanged(ifName,ifInfo) {
        if (ifName!==this.props.name)
            return;
        
        const {state,isScanning} = ifInfo

        const changed = ( state!==this.state.ifState || isScanning!==this.state.isScanning)
        if ( changed) 

            while (this.setStateBusy)
                await sleep(50)

            this.setStateBusy = true
            this.setState({ifState:state},(newState) => {
                this.setStateBusy = false
            })

    }

    onScanStateChanged(state) {
        
        const scanState = state
        const tsUpdate = Date.now()
        this.setState({scanState,tsUpdate})
    


    }


    render() {
        
        const {ifState,scanState} = this.state
        const {enabled} = this.props

        const onClick = ifState==='unavailable' ? undefined : this.props.onClick
        const props =  {
            ...this.props,onClick,
            ifState,enabled, scanState

        }
        return (
            <InterfaceInfo {...props}/>
        )

    }

}

export class InterfaceInfo  extends React.PureComponent{

    onClick() {
        if (this.props.ifState==='unavailable')
            return;
        if ( this.props.onClick) 
            this.props.onClick();
    }

    getLoader() {
        const { enabled,ifState,scanState} = this.props

        if (!enabled)
            return null
        if (ifState==='connecting' || ifState===undefined)
            return <ClipLoader color='white' size='1.2vh' loading={true}></ClipLoader>
        if (scanState==='started')
            return <BounceLoader color='red' size='1.2vh' loading={true}></BounceLoader>
        return null;
    }

    // outline token by interface state: connected = ok, down = danger, anything else while enabled
    // (connecting, not yet known) = accent; disabled/unavailable = null (muted)
    getOutline() {
        const {enabled,ifState} = this.props
        if (!enabled || ifState==='unavailable')
            return null
        if (ifState==='connected')
            return 'ok'
        if (ifState==='disconnected' || ifState==='disconnecting')
            return 'danger'
        return 'accent'
    }

    render() {
        const {name,ifState} = this.props
        const unavailable = ifState==='unavailable'
        const text = Texts[name] || name

        return (
            <Btn type='button' $outline={this.getOutline()} $unavailable={unavailable}
                onClick={()=>this.onClick()} >
                {this.getLoader()}
                {text}
            </Btn>
        )
    }
}
