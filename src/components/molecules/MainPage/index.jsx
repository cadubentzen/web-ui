import React from 'react';
import FullScreenContentArea from '../../atoms/FullScreenContentArea';
import styled from 'styled-components';
import { kitTokens } from '../../../theme';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: start;
    overflow: hidden;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: ${props => kitTokens(props.theme).pageBackground};

`


export const MainPage = ({children}) => {
    return (
        <Container>
            <FullScreenContentArea zIndex={1}>
                {children}
            </FullScreenContentArea>

        </Container>
    
    )

}

export default MainPage
