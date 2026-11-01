import React, { Component } from 'react';
import styled from 'styled-components';
import { AppThemeProvider, kitTokens } from '../../../theme';

const TabButton = styled.button`
    border: none;
    cursor: pointer;
    border-radius: 999px;
    padding: 0.4em 1.4vw;
    margin-right: 0.4vw;
    min-width: 0;
    flex: 0 1 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: inherit;
    font-size: 2.2vh;
    line-height: 1.4;
    white-space: nowrap;
    background: ${props => props.$selected ? kitTokens(props.theme).pillSelected : 'transparent'};
    color: ${props => props.$selected ? kitTokens(props.theme).pillSelectedText : kitTokens(props.theme).muted};

    &:hover {
      background: ${props => props.$selected ? kitTokens(props.theme).pillSelected : kitTokens(props.theme).pillHover};
    }
`

export class Tab extends Component {
    onClick = () => {
      const { label, onClick } = this.props;
      if (onClick) {
        onClick(label);
      }
    }
  
    render() {
      const { activeTab, label } = this.props;
      const selected = activeTab === label

      return (
        <AppThemeProvider>
          <TabButton
            type='button'
            role='tab'
            aria-selected={selected}
            $selected={selected}
            className={selected ? 'tab-list-item tab-list-active' : 'tab-list-item'}
            onClick={()=>this.onClick()}
          >
            {label}
          </TabButton>
        </AppThemeProvider>
      );
    }
  }
