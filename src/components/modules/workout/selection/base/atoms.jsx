import styled from "styled-components";
import { Row } from "../../../../atoms";
import { Panel } from "../../../../atoms/Panel";
import { kitTokens } from "../../../../../theme";

/** Glass workout card: fills the (fixed size) card slot, minus a small gutter between the cards */
export const Container = styled(Panel)`
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    width: calc(100% - 16px);
    height: calc(100% - 16px);
    margin: 8px;
    text-align: left;
    user-select: none;
    color: ${props => kitTokens(props.theme).pillSelectedText};
    ${props => props.$selected ? `border-color: ${kitTokens(props.theme).accent};` : ''}
    &:hover, &:focus-within { border-color: ${props => kitTokens(props.theme).accent}; }
`

/** Darker band at the top of a card; holds the workout profile (or the drop zone / logo) */
export const ImageContainer = styled.div`
    position: relative;
    flex: 0 0 46%;
    min-height: 0;
    box-sizing: border-box;
    padding: 0.6em 0.6em 0 0.6em;
    background: ${props => kitTokens(props.theme).panel.band};
    user-select: none;
`

export const DataContainer = styled.div`
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: space-between;
    min-height: 0;
    box-sizing: border-box;
    padding: 0.7em 0.9em 0.8em;
    gap: 0.25em;
`

export const Title = styled.div`
    font-size: 1.9vh;
    font-weight: bold;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`

export const Subtitle = styled.div`
    font-size: 1.5vh;
    color: ${props => kitTokens(props.theme).muted};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`

export const Footer = styled(Row)`
    align-items: center;
    justify-content: space-between;
    gap: 0.5em;
    font-size: 1.4vh;
    color: ${props => kitTokens(props.theme).muted};
`

export const Actions = styled(Row)`
    align-items: center;
    justify-content: flex-end;
    gap: 0.4em;
    width: auto;
`

export const LoaderContainer = styled.div`
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    inset: 0;
`
