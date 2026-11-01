import React from 'react'
import styled from 'styled-components'
import { Dynamic, View } from '../../../atoms'
import { AppThemeProvider } from '../../../../theme'
import { scrollbar } from '../../../../utils/scrollbar'

export const TILE_WIDTH = 280
export const TILE_HEIGHT = 388

const Container = styled(View)`
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(${TILE_WIDTH}px, 1fr));
  grid-auto-rows: ${TILE_HEIGHT}px;
  align-content: start;
  gap: 1.5vh 1vw;
  padding: 1.5vh 0;
  overflow-x: hidden;
  ${scrollbar}
`

const Tile = styled.div`
  position: relative;
  width: 100%;
  height: ${TILE_HEIGHT}px;
  z-index: 0;
  &:hover, &:focus-within { z-index: 1; }
`

export const RouteTilesView = ({ tiles = [], containerRef, observer, initialized,
  isOutsideFold, getFoldEvent, TileComponent }) => (
  <AppThemeProvider>
    <Container width="100%" height="100%" ref={containerRef}>
      {tiles.map(({ id, props }) => (
        <Tile className="route-tile" key={id}>
          <Dynamic observer={observer} event={getFoldEvent(id)} prop="outsideFold">
            <TileComponent {...props} singleCard outsideFold={initialized ? isOutsideFold(id) : true} />
          </Dynamic>
        </Tile>
      ))}
    </Container>
  </AppThemeProvider>
)
