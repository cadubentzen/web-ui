import styled from "styled-components";
import { kitTokens } from "../../../theme";

export const MainArea = styled.div`
    position: absolute;
    overflow: hidden;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    padding: 0;
    margin: 0;
    height: 100%;
    width:100%;
    background: ${props => kitTokens(props.theme).pageBackground};
`;
