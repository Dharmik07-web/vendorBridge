/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Material Design 3 - Primary
        'primary': '#006e2f',
        'primary-container': '#22c55e',
        'on-primary': '#ffffff',
        'on-primary-container': '#004b1e',
        'primary-fixed': '#6bff8f',
        'primary-fixed-dim': '#4ae176',
        'on-primary-fixed': '#002109',
        'on-primary-fixed-variant': '#005321',

        // Material Design 3 - Secondary
        'secondary': '#505f76',
        'on-secondary': '#ffffff',
        'secondary-container': '#d0e1fb',
        'on-secondary-container': '#54647a',
        'secondary-fixed': '#d3e4fe',
        'secondary-fixed-dim': '#b7c8e1',
        'on-secondary-fixed': '#0b1c30',
        'on-secondary-fixed-variant': '#38485d',

        // Material Design 3 - Tertiary
        'tertiary': '#5c5f61',
        'on-tertiary': '#ffffff',
        'tertiary-container': '#a9acae',
        'on-tertiary-container': '#3d4042',
        'tertiary-fixed': '#e0e3e5',
        'tertiary-fixed-dim': '#c4c7c9',
        'on-tertiary-fixed': '#191c1e',
        'on-tertiary-fixed-variant': '#444749',

        // Material Design 3 - Error
        'error': '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',

        // Material Design 3 - Surface
        'surface': '#faf8ff',
        'surface-dim': '#d2d9f4',
        'surface-bright': '#faf8ff',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f2f3ff',
        'surface-container': '#eaedff',
        'surface-container-high': '#e2e7ff',
        'surface-container-highest': '#dae2fd',
        'on-surface': '#131b2e',
        'on-surface-variant': '#3d4a3d',
        'surface-variant': '#dae2fd',
        'surface-tint': '#006e2f',

        // Material Design 3 - Inverse
        'inverse-surface': '#283044',
        'inverse-on-surface': '#eef0ff',
        'inverse-primary': '#4ae176',

        // Material Design 3 - Outline
        'outline': '#6d7b6c',
        'outline-variant': '#bccbb9',

        // Material Design 3 - Background
        'background': '#faf8ff',
        'on-background': '#131b2e',
      },
      borderRadius: {
        'DEFAULT': '0.25rem',
        'sm': '0.25rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        'full': '9999px',
      },
      spacing: {
        'unit': '4px',
        'stack-sm': '8px',
        'stack-md': '16px',
        'stack-lg': '32px',
        'gutter': '24px',
        'margin-mobile': '16px',
        'margin-desktop': '40px',
        'container-max': '1440px',
      },
      fontFamily: {
        'display-lg': ['Inter', 'sans-serif'],
        'headline-lg': ['Inter', 'sans-serif'],
        'headline-lg-mobile': ['Inter', 'sans-serif'],
        'title-md': ['Inter', 'sans-serif'],
        'body-lg': ['Inter', 'sans-serif'],
        'body-sm': ['Inter', 'sans-serif'],
        'label-caps': ['Geist', 'monospace'],
        'code': ['Geist', 'monospace'],
      },
      fontSize: {
        'display-lg': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-lg-mobile': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'title-md': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'label-caps': ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '600' }],
        'code': ['13px', { lineHeight: '18px', fontWeight: '400' }],
      },
      boxShadow: {
        'glass': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        'glass-lg': '0 20px 25px -5px rgb(0 0 0 / 0.1)',
      },
      backdropBlur: {
        'glass': '12px',
        'glass-lg': '20px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
