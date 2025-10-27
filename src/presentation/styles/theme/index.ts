// ========================================
// TEMA CENTRALIZADO - CORES E VARIÁVEIS
// ========================================

export const theme = {
    // Cores principais
    colors: {
        // Azul ciano - cor principal do sistema
        primary: '#00d9ff',
        primaryDark: '#00a8cc',
        primaryLight: '#00ffff',
        primaryHover: '#00b8d4',

        // Vermelho - alertas e perigo
        danger: '#ff4444',
        warning: '#ff9500',
        error: '#ff0064',

        // Laranja/Vermelho - CPU e temperatura
        accent: '#ff6b4a',
        accentLight: '#ff6b6b',

        // Preto e cinza - backgrounds
        background: {
            primary: 'rgba(0, 0, 0, 0.95)',
            secondary: 'rgba(0, 0, 0, 0.8)',
            tertiary: 'rgba(0, 0, 0, 0.5)',
            modal: 'rgba(0, 0, 0, 0.9)',
            overlay: 'rgba(0, 0, 0, 0.3)',
            dark: '#0a0a0a',
            medium: '#1a1a1a',
            light: '#2a2a2a'
        },

        // Branco e cinza - textos
        text: {
            primary: '#fff',
            secondary: '#888',
            muted: 'rgba(0, 217, 255, 0.3)'
        },

        // Bordas e divisores
        border: {
            primary: '#00d9ff',
            secondary: 'rgba(0, 217, 255, 0.3)',
            light: 'rgba(0, 217, 255, 0.2)',
            hover: '#00ffff'
        },

        // Estados de transparência
        alpha: {
            primary05: 'rgba(0, 217, 255, 0.05)',
            primary10: 'rgba(0, 217, 255, 0.1)',
            primary15: 'rgba(0, 217, 255, 0.15)',
            primary20: 'rgba(0, 217, 255, 0.2)',
            primary30: 'rgba(0, 217, 255, 0.3)',
            primary40: 'rgba(0, 217, 255, 0.4)',
            primary50: 'rgba(0, 217, 255, 0.5)',
            primary60: 'rgba(0, 217, 255, 0.6)',
            black70: 'rgba(0, 0, 0, 0.7)'
        }
    },

    // Gradientes
    gradients: {
        primary: 'linear-gradient(135deg, #00d9ff, #00a8cc)',
        primaryLight: 'linear-gradient(135deg, #00ffff, #00d9ff)',
        temperature: 'linear-gradient(90deg, #ff4444, #00d9ff)',
        equalizer: 'linear-gradient(to top, #00d9ff, #00a8cc)',
        shimmer: 'linear-gradient(90deg, transparent, rgba(0, 217, 255, 0.3), transparent)'
    },

    // Sombras
    shadows: {
        primary: '0 0 10px rgba(0, 217, 255, 0.3)',
        primaryStrong: '0 0 15px rgba(0, 217, 255, 0.3)',
        primaryGlow: '0 0 25px rgba(0, 217, 255, 0.6), 0 0 50px rgba(0, 217, 255, 0.3)',
        widget: '0 0 15px rgba(0, 217, 255, 0.2)',
        modal: '0 0 30px rgba(0, 217, 255, 0.5)',
        text: {
            primary: '0 0 10px rgba(0, 217, 255, 0.5)',
            white: '0 0 15px rgba(255, 255, 255, 0.8)',
            danger: '0 0 10px rgba(255, 107, 107, 0.5)',
            accent: '0 0 5px rgba(255, 149, 0, 0.5)',
            error: '0 0 5px rgba(255, 68, 68, 0.5)',
            location: '0 0 20px rgba(0, 217, 255, 0.8)',
            control: '0 0 5px rgba(0, 217, 255, 0.5)'
        }
    },

    // Filtros CSS
    filters: {
        primaryIcon: 'brightness(0) saturate(100%) invert(58%) sepia(94%) saturate(2574%) hue-rotate(160deg) brightness(101%) contrast(101%)',
        whiteIcon: 'brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(200%) contrast(100%)',
        warningGlow: 'drop-shadow(0 0 5px #ff9500)',
        dangerGlow: 'drop-shadow(0 0 5px #ff4444)'
    },

    // Tipografia (relativos ao font-size base do navegador)
    typography: {
        fontFamily: "'Courier New', monospace",
        sizes: {
            xs: '0.5625rem',   // ~9px se base = 16px
            sm: '0.625rem',    // ~10px
            base: '0.6875rem', // ~11px
            md: '0.75rem',     // ~12px
            lg: '0.8125rem',   // ~13px
            xl: '1rem',        // ~16px (base)
            '2xl': '1.125rem', // ~18px
            '3xl': '1.25rem',  // ~20px
            '4xl': '1.5rem',   // ~24px
            '5xl': '1.5625rem', // ~25px
            '6xl': '2rem'      // ~32px
        },
        letterSpacing: {
            tight: '0.0625rem',  // ~1px
            normal: '0.125rem',  // ~2px
            wide: '0.1875rem'    // ~3px
        }
    },

    // Espaçamentos (relativos ao font-size base)
    spacing: {
        xs: '0.25rem',   // ~4px se base = 16px
        sm: '0.5rem',    // ~8px
        md: '0.625rem',  // ~10px
        lg: '0.75rem',   // ~12px
        xl: '1rem',      // ~16px
        '2xl': '1.25rem', // ~20px
        '3xl': '1.5rem',  // ~24px
        '4xl': '2.5rem',  // ~40px
        '5xl': '3rem'     // ~48px
    },

    // Dimensões (usando unidades relativas e responsivas)
    dimensions: {
        widget: {
            width: '20rem',      // Relativo ao font-size
            height: '24rem',     // Relativo ao font-size
            minHeight: '24rem',  // Relativo ao font-size
            maxHeight: '24rem'   // Relativo ao font-size
        },
        hexagon: {
            width: '9.375rem',   // ~150px se base = 16px
            height: '8.4375rem'  // ~135px se base = 16px
        },
        cpu: {
            width: '5.625rem',   // ~90px se base = 16px
            height: '5.625rem'   // ~90px se base = 16px
        },
        icon: {
            sm: '1.5rem',        // ~24px
            md: '1.875rem',      // ~30px
            lg: '2rem'           // ~32px
        },
        // Dimensões responsivas para diferentes breakpoints
        responsive: {
            mobile: {
                widget: {
                    width: '18rem',
                    height: '20rem'
                }
            },
            tablet: {
                widget: {
                    width: '22rem',
                    height: '26rem'
                }
            }
        }
    },

    // Transições
    transitions: {
        fast: 'all 0.1s ease-out',
        normal: 'all 0.2s',
        smooth: 'all 0.3s',
        slow: 'all 0.3s ease',
        opacity: 'opacity 1s ease-in-out',
        dashOffset: 'stroke-dashoffset 0.5s ease',
        shimmer: 'left 0.5s'
    },

    // Animações
    animations: {
        fadeIn: 'fadeIn 0.3s ease',
        slideIn: 'slideIn 0.3s ease',
        pulse: 'pulse 2s ease-out infinite',
        float: 'float 3s ease-in-out infinite'
    },

    // Clip paths para formas geométricas
    clipPaths: {
        hexagon: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
        trapezoidTop: 'polygon(90% 100%, 10% 100%, 0% 0%, 100% 0%)',
        trapezoidBottom: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)',
        trapezoidLeft: 'polygon(0 0, 100% 0, 85% 100%, 0% 100%)',
        trapezoidRight: 'polygon(0 0, 85% 0, 100% 100%, 0% 100%)',
        angleLeft: 'polygon(0 0, 100% 0, 100% 100%, 15% 100%)',
        angleRight: 'polygon(15% 0, 100% 0, 100% 100%, 0 100%)'
    },

    // Z-index layers
    zIndex: {
        base: 0,
        overlay: 1,
        dropdown: 2,
        tooltip: 3,
        modal: 1000
    },

    // Breakpoints para responsividade
    breakpoints: {
        xs: '320px',   // Mobile pequeno
        sm: '480px',   // Mobile
        md: '768px',   // Tablet
        lg: '1024px',  // Desktop pequeno
        xl: '1280px',  // Desktop
        '2xl': '1536px' // Desktop grande
    },

    // Valores responsivos usando vw/vh
    responsive: {
        // Espaçamentos que se adaptam ao viewport
        spacing: {
            xs: 'clamp(0.25rem, 0.5vw, 0.5rem)',
            sm: 'clamp(0.5rem, 1vw, 1rem)',
            md: 'clamp(0.625rem, 1.25vw, 1.25rem)',
            lg: 'clamp(0.75rem, 1.5vw, 1.5rem)',
            xl: 'clamp(1rem, 2vw, 2rem)',
            '2xl': 'clamp(1.25rem, 2.5vw, 2.5rem)',
            '3xl': 'clamp(1.5rem, 3vw, 3rem)',
            '4xl': 'clamp(2.5rem, 4vw, 4rem)',
            '5xl': 'clamp(3rem, 5vw, 5rem)'
        },

        // Tipografia que se adapta ao viewport
        fontSize: {
            xs: 'clamp(0.5rem, 1vw, 0.625rem)',
            sm: 'clamp(0.625rem, 1.2vw, 0.75rem)',
            base: 'clamp(0.6875rem, 1.4vw, 0.875rem)',
            md: 'clamp(0.75rem, 1.6vw, 1rem)',
            lg: 'clamp(0.8125rem, 1.8vw, 1.125rem)',
            xl: 'clamp(1rem, 2vw, 1.25rem)',
            '2xl': 'clamp(1.125rem, 2.2vw, 1.375rem)',
            '3xl': 'clamp(1.25rem, 2.5vw, 1.5rem)',
            '4xl': 'clamp(1.5rem, 3vw, 2rem)',
            '5xl': 'clamp(1.5625rem, 3.2vw, 2.125rem)',
            '6xl': 'clamp(2rem, 4vw, 2.5rem)'
        },

        // Dimensões de widgets responsivas
        widget: {
            width: 'clamp(18rem, 20vw, 22rem)',
            height: 'clamp(20rem, 24vh, 26rem)',
            gap: 'clamp(0.5rem, 1vw, 1rem)'
        }
    }
} as const;

// Tipos TypeScript para o tema
export type Theme = typeof theme;
export type ThemeColors = typeof theme.colors;
export type ThemeSpacing = typeof theme.spacing;

// Hook para usar o tema em componentes React
export const useTheme = () => theme;

// Funções utilitárias para valores responsivos
export const responsive = {
    // Função para criar valores clamp responsivos
    clamp: (min: string, preferred: string, max: string) =>
        `clamp(${min}, ${preferred}, ${max})`,

    // Função para criar media queries
    mediaQuery: (breakpoint: keyof typeof theme.breakpoints) =>
        `@media (min-width: ${theme.breakpoints[breakpoint]})`,

    // Função para espaçamento responsivo
    spacing: (size: keyof typeof theme.responsive.spacing) =>
        theme.responsive.spacing[size],

    // Função para tipografia responsiva
    fontSize: (size: keyof typeof theme.responsive.fontSize) =>
        theme.responsive.fontSize[size],

    // Função para criar grid responsivo
    grid: (minWidth: string = '18rem', gap: string = '1rem') => ({
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}, 1fr))`,
        gap: gap,
        width: '100%'
    })
};

// Utilitários para CSS-in-JS
export const css = {
    // Função para criar estilos com o tema
    widget: {
        base: {
            border: `1px solid ${theme.colors.primary}`,
            background: theme.colors.background.secondary,
            padding: theme.spacing.xl,
            borderRadius: '0.125rem', // 2px em rem
            height: theme.dimensions.widget.height,
            minHeight: theme.dimensions.widget.minHeight,
            maxHeight: theme.dimensions.widget.maxHeight,
            width: theme.dimensions.widget.width,
            display: 'flex',
            flexDirection: 'column' as const,
            gap: theme.spacing.md,
            transition: theme.transitions.smooth
        },

        // Widget responsivo
        responsive: {
            border: `1px solid ${theme.colors.primary}`,
            background: theme.colors.background.secondary,
            padding: theme.responsive.spacing.xl,
            borderRadius: '0.125rem',
            height: theme.responsive.widget.height,
            width: theme.responsive.widget.width,
            display: 'flex',
            flexDirection: 'column' as const,
            gap: theme.responsive.widget.gap,
            transition: theme.transitions.smooth
        }
    },

    button: {
        primary: {
            background: theme.gradients.primary,
            color: theme.colors.background.dark,
            border: `2px solid ${theme.colors.primary}`,
            boxShadow: theme.shadows.primary,
            transition: theme.transitions.smooth,
            fontFamily: theme.typography.fontFamily,
            letterSpacing: theme.typography.letterSpacing.normal,
            fontWeight: 'bold',
            textTransform: 'uppercase' as const
        },

        secondary: {
            background: theme.colors.background.tertiary,
            color: theme.colors.primary,
            border: `1px solid ${theme.colors.primary}`,
            transition: theme.transitions.smooth,
            fontFamily: theme.typography.fontFamily
        }
    },

    text: {
        title: {
            fontSize: theme.typography.sizes.sm,
            color: theme.colors.primary,
            letterSpacing: theme.typography.letterSpacing.tight,
            fontFamily: theme.typography.fontFamily,
            textTransform: 'uppercase' as const,
            fontWeight: 'bold'
        },

        body: {
            fontSize: theme.typography.sizes.base,
            color: theme.colors.text.primary,
            fontFamily: theme.typography.fontFamily
        }
    }
};

export default theme;