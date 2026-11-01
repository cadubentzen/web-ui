import React from 'react';
import styled from 'styled-components';
import { Setting } from './Setting'
import { Label } from './Label';
import { kitTokens } from '../../../../theme';

const Value = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.8em;
    min-width: 0;
`

const Description = styled.div`
    font-size: 0.8em;
    color: ${props => kitTokens(props.theme).muted};
`

/**
 * One settings row. Renders two grid cells (label, value + description), so it must be placed
 * inside a two-column grid (see `PropertyGrid`).
 */
export const Property = (props) => {
    const {property, settings} = props
    if (property.condition && property.condition(settings)===false) 
        return null;

    return (
        <>
            <Label>{property.name}</Label>
            <Value>
                <Setting {...props}/>
                {property.description ? <Description>{property.description}</Description> : null}
            </Value>
        </>
    )

}

/** Two-column label / field grid for `Property` rows */
export const PropertyGrid = styled.div`
    display: grid;
    grid-template-columns: minmax(12ch, 22%) 1fr;
    align-items: center;
    column-gap: 1.5vw;
    row-gap: 1.2vh;
    font-size: 1.8vh;
    text-align: left;
`
