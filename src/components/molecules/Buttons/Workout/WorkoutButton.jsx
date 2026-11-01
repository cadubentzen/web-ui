import React from "react"
import { Button, Center, Icon, AutoHide } from "../../../atoms"
import styled from "styled-components";
import { copyPropsExcluding } from "../../../../utils/props";


const Btn = styled(Button)`
    background: ${props => props.background||'none'} ;
    position: relative;
    float: left;
    display: flex;
    cursor: pointer;
    width: ${props => props.$box ?? props.size} ;
    height: ${props => props.$box ?? props.size};
    flex: none;
    box-sizing: border-box;
    ${props => props.$box ? `margin: 0; padding: 0; font-size: min(1.1vw, 1.5vh); line-height: 1;` : ''}
    border: ${props => `1px solid ${props.borderColor || props.color || 'lightgrey'}`}; 
    border-radius: ${props => props.$radius ?? '8px'};
    user-select: none;
    opacity:  ${props => props.opacity};
`;    


const Hotkey = styled(Center)`
    position: absolute;
    top: 0;
    left:0;
    height: 15px;
    width: fit-content;
    padding: 0 0.5ch 0 0.5ch;
    font-size: 10px;
    color: ${props => props.textColor ||'black' };
    border-color: black;    
    border: 3px groove;
    border-radius: 4px;
    
`



export const WorkoutButton = (props) => {

    const {width,height,size=60,boxSize,hotkey,color,image,children,text,showHotkey=true } = props

    const btnProps = copyPropsExcluding(props,['image','children', 'width', 'height', 'size','text','boxSize'])    
    const icnProps = copyPropsExcluding(props,['$radius','size','width', 'height','onClick','boxSize'])

    icnProps.width = width??size
    icnProps.height = height??size
    icnProps.size = size  

    return <Btn {...btnProps} size={`${size+20}px`} $box={boxSize}>
        <Center position='relative'>            
            {children||image ? <Icon {...icnProps} margin={0} raw />:null}
            {text}
        </Center>
        {hotkey&&showHotkey ? 
            <AutoHide delay={3000} disableMouseOver>
                <Hotkey length={hotkey.length} textColor={color}> {hotkey}</Hotkey> 
            </AutoHide>
            : null }

    </Btn>
}