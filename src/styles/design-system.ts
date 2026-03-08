export const designTokens = {
  colors: {
    // deep dark navy, like VS Code dark+
    background: '#0A0E1A',
    // card/panel backgrounds
    surface: '#111827',
    // elevated surfaces, dropdowns
    surface2: '#1E2535',
    // subtle borders
    border: '#2D3A4F',
    // primary CTA, active states — electric blue
    accent: '#00B0FF',
    // hover state
    accentHover: '#40C4FF',
    // green — valid/success states
    success: '#00C853',
    // amber — warnings
    warning: '#FFB300',
    // red — errors, invalid
    error: '#F44336',
    // main body text
    textPrimary: '#E2E8F0',
    // muted labels, placeholders
    textSecondary: '#94A3B8',
    // disabled, hints
    textMuted: '#64748B',
  },
  fonts: {
    // all navigation, labels, buttons
    ui: ['Inter', 'sans-serif'],
    // all code editors, code previews
    code: ['JetBrains Mono', 'monospace'],
  },
  fontSizes: {
    12: '12px',
    14: '14px',
    16: '16px',
    18: '18px',
    20: '20px',
    24: '24px',
    28: '28px',
    32: '32px',
    40: '40px',
  },
  spacing: {
    // 4px base grid
    4: '4px',
    8: '8px',
    12: '12px',
    16: '16px',
    24: '24px',
    32: '32px',
    48: '48px',
    64: '64px',
  },
  layout: {
    // Max content width: 1280px, centered
    maxWidth: '1280px',
    // Sidebar nav for tool categories on desktop
    sidebarWidth: '240px',
  },
  borderRadius: {
    // Buttons: not rounded-full
    lg: '8px',
    // Cards: subtle border, no drop shadow
    xl: '12px',
  },
  animations: {
    // Copy button: flash green for 1.2s on click, then revert
    flash: 'flash-green 1.2s ease-in-out',
    // Tabs/toggles: 150ms ease transition
    transition150: '150ms',
  },
  keyframes: {
    flashGreen: {
      '0%, 100%': { backgroundColor: 'transparent' },
      '10%, 90%': { backgroundColor: '#00C853' }, // success color
    }
  }
};

/**
 * CSS Variables string for injection into global styles.
 * E.g. in your global.css: 
 * :root { ...variables }
 */
export const cssVariables = `
  :root {
    --bg-main: ${designTokens.colors.background};
    --bg-surface: ${designTokens.colors.surface};
    --bg-surface2: ${designTokens.colors.surface2};
    --border-color: ${designTokens.colors.border};
    --accent-primary: ${designTokens.colors.accent};
    --accent-hover: ${designTokens.colors.accentHover};
    --color-success: ${designTokens.colors.success};
    --color-warning: ${designTokens.colors.warning};
    --color-error: ${designTokens.colors.error};
    --text-primary: ${designTokens.colors.textPrimary};
    --text-secondary: ${designTokens.colors.textSecondary};
    --text-muted: ${designTokens.colors.textMuted};
  }
`;

/**
 * Tailwind Configuration extension block.
 * Can be merged directly into tailwind.config.ts -> theme.extend
 */
export const tailwindThemeExtension = {
  colors: {
    background: designTokens.colors.background,
    surface: designTokens.colors.surface,
    surface2: designTokens.colors.surface2,
    border: designTokens.colors.border,
    accent: designTokens.colors.accent,
    accentHover: designTokens.colors.accentHover,
    success: designTokens.colors.success,
    warning: designTokens.colors.warning,
    error: designTokens.colors.error,
    textPrimary: designTokens.colors.textPrimary,
    textSecondary: designTokens.colors.textSecondary,
    textMuted: designTokens.colors.textMuted,
  },
  fontFamily: {
    ui: designTokens.fonts.ui,
    code: designTokens.fonts.code,
  },
  fontSize: {
    12: designTokens.fontSizes[12],
    14: designTokens.fontSizes[14],
    16: designTokens.fontSizes[16],
    18: designTokens.fontSizes[18],
    20: designTokens.fontSizes[20],
    24: designTokens.fontSizes[24],
    28: designTokens.fontSizes[28],
    32: designTokens.fontSizes[32],
    40: designTokens.fontSizes[40],
  },
  spacing: {
    4: designTokens.spacing[4],
    8: designTokens.spacing[8],
    12: designTokens.spacing[12],
    16: designTokens.spacing[16],
    24: designTokens.spacing[24],
    32: designTokens.spacing[32],
    48: designTokens.spacing[48],
    64: designTokens.spacing[64],
  },
  maxWidth: {
    content: designTokens.layout.maxWidth,
  },
  width: {
    sidebar: designTokens.layout.sidebarWidth,
  },
  borderRadius: {
    lg: designTokens.borderRadius.lg,
    xl: designTokens.borderRadius.xl,
  },
  animation: {
    'flash-green': designTokens.animations.flash,
  },
  keyframes: {
    'flash-green': designTokens.keyframes.flashGreen,
  },
  transitionDuration: {
    150: designTokens.animations.transition150,
  },
};

/**
 * Component Rules & Layout Guidelines:
 * 
 * - Buttons: rounded-lg (8px), not rounded-full
 * - Cards: rounded-xl (12px), subtle border, no drop shadow
 * - Code editors: dark theme always, no light mode toggle on editors
 * - All inputs: bg-surface2 border-border focus:border-accent
 * - Copy buttons: top-right corner of every output box, icon only
 * 
 * Layout:
 * - Max content width: 1280px, centered
 * - Tool pages (desktop): 2-column split (input left, output right)
 * - Tool pages (mobile): stacked (input top, output bottom)
 * - Sidebar nav for tool categories on desktop (240px wide)
 */
