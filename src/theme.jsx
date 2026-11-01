import React from "react"
import { ThemeProvider, useTheme } from "styled-components"

const base = {
    text: "black",
    theme: "#8dc100",
    link: "#8dc100",
    hover: "#8dc100",
    searching: "darkgrey",
    failed: "darkred",
    primaryButton: "#dd9933",
    secondaryButton: "none",
    normalButton: "#dd9933",
    disabledButton: "lightgrey",

    success: 'green',
    error:'red',
    warning:'#eb6100',
    info:'#005ea5',
    incomplete:'#bebebe',

    successText: 'white',
    errorText:'white',
    warningText:'black',
    infoText:'white',
    incompleteText:'black',

    primaryButtonText: "white",
    secondaryButtonText: "white",
    normalButtonText: "white",
    disabledButtonText: "white"


}

const background = {
    primary : "#0048BA",
    normal: "white",
    odd: "#CCCCCC",
    hover: "#8dc100",
    header: "#2c3e50",
    selected: "#dd9933"

}

const text = {
    primary : "#FFFFFF",
    normal: base.text
}

const _default = {
    title: {
        background:  "white",
        text: "#8dc100"
    },
    list: {
        header: {
            background:  background.header,
            text: 'white'   
        },
        selected: {
            background:  background.selected,
            text: text.primary    
        },
        hover: {
            background:  background.hover,
            text: text.primary    
        },
        normal: {
            background:  background.normal,
            text: text.normal    
        },
        even: {
            text: text.normal    
        },
        odd: {
            text: text.normal    
        }

    },
    button : {
        hover: {
            background: base.hover,
            text: base.primaryButtonText
        },
        primary: {
            background: base.primaryButton,
            text: base.primaryButtonText
        },
        normal: {
            background: base.normalButton,
            text: base.normalButtonText
        }, 
        disabled: {
            background: base.disabledButton,
            text: base.disabledButtonText
        }, 
        secondary: {
            background: base.secondaryButton,
            text: base.secondaryButtonText
        } 
    },
    devices : {
        hover: {
            background: base.hover,
            text: base.primaryButtonText
        },
        selected: {
            background: base.normalButton,
            text: base.normalButtonText
        }, 
        searching: {
            background: base.searching,
            text: base.normalButtonText
        },
        failed: {
            background: base.searching,
            text: base.normalButtonText
        } 
    },
    dialog: {
        background: 'linear-gradient(to bottom,rgba(255,255,255,1) 0%,rgba(222,222,222,1) 100%)',
        text:'black;'
    },
    dialogContent: {
        background: 'white',
        text:'black;'
    },
    buttonbar: {
        background: 'lightgrey'
    },


    rider: {
        helmet: 'yellow',
        shirt: 'yellow'//'#FFD700'
    },
    url: {
        color: 'blue'
    },
    colors: base
}

export const newUITheme = {
    title: {
        background:  "none",
        text: "white"
    },
    list: {
        header: {
            background:  'none',
            text: 'white'   
        },
        selected: {
            background:  background.selected,
            text: text.primary    
        },
        hover: {
            background:  background.hover,
            text: text.primary    
        },
        normal: {
            background:  'none',
            text: 'white'
        },
        even: {
            background:  'none',
            text: 'white'
        },
        odd: {
            background:  'none',
            text: 'white'
        },
        button: {
            background: 'none'
        }

    },
    button : {
        hover: {
            background: base.hover,
            text: base.primaryButtonText
        },
        primary: {
            background: base.primaryButton,
            text: base.primaryButtonText
        },
        normal: {
            background: base.normalButton,
            text: base.normalButtonText
        }, 
        disabled: {
            background: base.disabledButton,
            text: base.disabledButtonText
        }, 
        secondary: {
            background: base.secondaryButton,
            text: base.secondaryButtonText
        } 
    },
    devices : {
        hover: {
            background: base.hover,
            text: base.primaryButtonText
        },
        selected: {
            background: base.normalButton,
            text: base.normalButtonText
        }, 
        searching: {
            background: base.searching,
            text: base.normalButtonText
        },
        failed: {
            background: base.searching,
            text: base.normalButtonText
        } 
    },
    dialog: {
        background1: 'rgb(33,33,33,0.975)',
        background: 'linear-gradient(rgb(56,1,31,0.975),rgb(26,4,86,0.975))',
        background2: 'linear-gradient(#38011f,#180457)',
        
        

        text:'white',
        border:'#C0C0C0 1px solid',
        borderRadius: '1vh 1vw'
        
    },
    pageLists: {
        background: 'linear-gradient(rgb(56,1,31,0.3),rgb(26,4,86,0.3))',
    },
    dialogContent: {
        background: 'none',
        text:'white;'
    },

    buttonbar: {
        background: 'none'
    },
    navbar: {
        selected: {
            background: '#ffffff',
            text: '#1c0b2a',
        },
        normal: {
            background: 'none',
            text: 'rgba(255,255,255,0.7)',
        },
        rail: 'rgba(0,0,0,0.22)',
        radius: '0.7em',
        railRadius: '1em',
    },

    rider: {
        helmet: '#E78200',
        shirt: 'white'//'#FFD700'
    },
    url: {
        color: 'cyan'
    },
    colors: { ...base, accent: '#e4a13c', accentText: '#1c1203', danger: '#ff6b6b' },
    page: {
        background: 'radial-gradient(120% 90% at 85% -10%, #4a1240 0%, transparent 55%), linear-gradient(160deg, #24081f 0%, #160a3c 100%)',
    },
    panel: {
        fill: 'rgba(255,255,255,0.06)',
        borderColor: 'rgba(255,255,255,0.14)',
        radius: '0.9em',
    },
    field: {
        fill: 'rgba(255,255,255,0.1)',
        borderColor: 'rgba(255,255,255,0.14)',
        radius: '0.55em',
    },
    pill: {
        selected: 'rgba(255,255,255,0.14)',
        outline: 'rgba(255,255,255,0.3)',
        hover: 'rgba(255,255,255,0.08)',
        track: 'rgba(255,255,255,0.2)',
    },
    hud: {
        panel: 'linear-gradient(rgba(56,1,31,0.72), rgba(26,4,86,0.72))',
        border: 'rgba(255,255,255,0.16)',
        hairline: 'rgba(255,255,255,0.18)',
        text: '#ffffff',
        muted: 'rgba(255,255,255,0.7)',
        track: 'rgba(255,255,255,0.15)',
        radius: '0.9vw',
        warning: '#FFBF00',
        error: '#ff4d4d',
    },
}
/**
 * The HUD design tokens: the theme's `hud` values (and accent colours) merged over the newUI defaults,
 * so that components still render correctly under themes that do not define them.
 *
 * @param {object} [theme] the styled-components theme
 */
export const hudTokens = (theme) => ({
    ...newUITheme.hud,
    ...(theme?.hud ?? {}),
    accent: theme?.colors?.accent ?? newUITheme.colors.accent,
    accentText: theme?.colors?.accentText ?? newUITheme.colors.accentText,
})

/**
 * The kit design tokens shared by all screens (page background, glass panel, field, pill, danger colour):
 * the theme's values merged over the newUI defaults, so that components still render correctly under
 * themes that do not define them.
 *
 * @param {object} [theme] the styled-components theme
 */
const withBorder = (t) => ({ ...t, border: `1px solid ${t.borderColor}` })

export const kitTokens = (theme) => ({
    pageBackground: theme?.page?.background ?? newUITheme.page.background,
    panel: withBorder({ ...newUITheme.panel, ...(theme?.panel ?? {}) }),
    field: withBorder({ ...newUITheme.field, ...(theme?.field ?? {}) }),
    pillSelected: theme?.pill?.selected ?? newUITheme.pill.selected,
    pillHover: theme?.pill?.hover ?? newUITheme.pill.hover,
    pillOutline: theme?.pill?.outline ?? newUITheme.pill.outline,
    switchOff: theme?.pill?.track ?? newUITheme.pill.track,
    muted: theme?.hud?.muted ?? newUITheme.hud.muted,
    navRail: theme?.navbar?.rail ?? newUITheme.navbar.rail,
    navRailRadius: theme?.navbar?.railRadius ?? newUITheme.navbar.railRadius,
    navTile: theme?.navbar?.selected?.background ?? newUITheme.navbar.selected.background,
    navTileText: theme?.navbar?.selected?.text ?? newUITheme.navbar.selected.text,
    navTileRadius: theme?.navbar?.radius ?? newUITheme.navbar.radius,
    pillSelectedText: theme?.hud?.text ?? newUITheme.hud.text,
    danger: theme?.colors?.danger ?? newUITheme.colors.danger,
    accent: theme?.colors?.accent ?? newUITheme.colors.accent,
    accentText: theme?.colors?.accentText ?? newUITheme.colors.accentText,
})

/** kitTokens() for the theme of the current styled-components context */
export const useKitTokens = () => kitTokens(useTheme())

/** hudTokens() for the theme of the current styled-components context */
export const useHudTokens = () => hudTokens(useTheme())

class Theme {

    constructor( ) {
        this.selected = "default";
        this.themes = {}; 

        this.add ("default",_default);
    }

    add( name, theme) {


        theme.menu = {
            background: theme.dialog.background,
            text: theme.dialog.text,
            border: theme.dialog.border,
            
            selected: theme.dialog.selected ?? {
                background:  background.selected,
                text: text.primary    
            },
            hover: theme.dialog.hover ?? {
                background:  background.hover,
                text: text.primary    
            },
        
        
        }
        this.themes[name]= theme;
        
    }

    select( name) {
        this.selected = name
    }

    get( name ) {

        return ( (name===undefined || this.themes[name]===undefined) ? this.themes[this.selected] : this.themes[name])
    }
 
}

const AppTheme = new Theme()

export const AppThemeProvider = (props)=> <ThemeProvider theme={AppTheme.get()} {...props}/>

export default AppTheme
