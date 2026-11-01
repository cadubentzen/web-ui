import React, {  useState } from "react"
import { Loader } from "../../../atoms"
import { useFloating,   useHover, useClick,
    useInteractions,
    safePolygon} from '@floating-ui/react';
import styled from "styled-components";
import { AppThemeProvider, useKitTokens } from "../../../../theme";
import { Chip, ChipMenu, ChipMenuItem } from "../PillChip";
import { copyPropsExcluding } from "../../../../utils/props";
import { EventLogger } from "gd-eventlog";


const PillContainer = styled.div`
    width: max-content;
    max-width: 100%;
    opacity: ${props => props.isLoading ? 0.5 : 1};   
    user-select: none;
    position: ${props => props.isLoading ? 'relative' : undefined };
`

const LoaderContainer = styled.div`  
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
`

export const UploadPill = ( props) => {
    const logger = new EventLogger('Incyclist')
    const kit = useKitTokens()

    const [isOpen, setIsOpen] = useState(false)
    const {refs, floatingStyles,context} = useFloating({
            placement: 'bottom-start',
            open: isOpen,
            strategy: 'absolute',            
            onOpenChange: setIsOpen
    })

    const click = useClick(context)
    const hover = useHover(context,{  handleClose: safePolygon({
        requireIntent: false,
      }),})

    const {getReferenceProps, getFloatingProps} = useInteractions([click,hover]);
    

    const pillProps = copyPropsExcluding(props,['tone','size','onOpen','onSynchronize','canOpen','canSynchronize','loading'])
    const {onOpen, onSynchronize,canOpen, canSynchronize,loading} = props
    const isDeactivated = (!canOpen && !canSynchronize) || loading


    const onOpenHandler = () => { 
        logger.logEvent({message:'pill clicked', pill: `Open: ${pillProps.text}`, eventSource:'user'})

        setIsOpen(false)
        if (typeof onOpen === 'function') {
            onOpen()
        }
    }

    const onSynchronizeHandler = () => { 
        logger.logEvent({message:'pill clicked', pill: `Synchronize: ${pillProps.text}`, eventSource:'user'})
        setIsOpen(false)
        if (typeof onSynchronize === 'function') {
            onSynchronize()
        }
    }

    const floatingRef = !isDeactivated ? refs?.setReference : null
    const referenceProps = !isDeactivated ? getReferenceProps() : {}

    return (
        <AppThemeProvider>
            <>
                <PillContainer ref={floatingRef} {...referenceProps} isLoading={loading} >                
                        <Chip type='button' $tone={props.tone} disabled={isDeactivated} aria-haspopup='menu'>{pillProps.text}</Chip>                    
                        {loading ? <LoaderContainer><Loader size='1vh' color={kit.muted} /></LoaderContainer> : null}    
                </PillContainer>
                
                { isOpen && !isDeactivated ?
                <div ref={refs.setFloating}  {...getFloatingProps()} style={{...floatingStyles}}>            

                        <ChipMenu role='menu'>
                            {canSynchronize ? <ChipMenuItem onClick={onSynchronizeHandler}>Synchronize</ChipMenuItem> : null}
                            {canOpen?<ChipMenuItem onClick={onOpenHandler}>Open</ChipMenuItem>: null}
                        </ChipMenu> 
                        
                </div> : null}
            </>
        </AppThemeProvider>
    )
}