import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Professional editorial palette inspired by NYT/Bloomberg
        primary: {
          50: 'oklch(0.985 0 0 / <alpha-value>)',
          100: 'oklch(0.97 0 0 / <alpha-value>)',
          200: 'oklch(0.922 0 0 / <alpha-value>)',
          300: 'oklch(0.87 0 0 / <alpha-value>)',
          400: 'oklch(0.715 0 0 / <alpha-value>)',
          500: 'oklch(0.5 0 0 / <alpha-value>)',
          600: 'oklch(0.439 0 0 / <alpha-value>)',
          700: 'oklch(0.371 0 0 / <alpha-value>)',
          800: 'oklch(0.269 0 0 / <alpha-value>)',
          900: 'oklch(0.205 0 0 / <alpha-value>)',
          950: 'oklch(0.145 0 0 / <alpha-value>)',
        },
        // Warm accent — constant hue keeps the scale visually coherent.
        accent: {
          50: 'oklch(0.98 0.011 50 / <alpha-value>)',
          100: 'oklch(0.957 0.024 50 / <alpha-value>)',
          200: 'oklch(0.906 0.052 50 / <alpha-value>)',
          300: 'oklch(0.84 0.093 50 / <alpha-value>)',
          400: 'oklch(0.759 0.134 50 / <alpha-value>)',
          500: 'oklch(0.693 0.16 50 / <alpha-value>)',
          600: 'oklch(0.622 0.164 50 / <alpha-value>)',
          700: 'oklch(0.533 0.14 50 / <alpha-value>)',
          800: 'oklch(0.457 0.12 50 / <alpha-value>)',
          900: 'oklch(0.4 0.099 50 / <alpha-value>)',
        },
        // Sophisticated neutral grays
        gray: {
          50: 'oklch(0.985 0 0 / <alpha-value>)',
          100: 'oklch(0.97 0 0 / <alpha-value>)',
          200: 'oklch(0.922 0 0 / <alpha-value>)',
          300: 'oklch(0.87 0 0 / <alpha-value>)',
          400: 'oklch(0.715 0 0 / <alpha-value>)',
          500: 'oklch(0.5 0 0 / <alpha-value>)',
          600: 'oklch(0.439 0 0 / <alpha-value>)',
          700: 'oklch(0.371 0 0 / <alpha-value>)',
          800: 'oklch(0.269 0 0 / <alpha-value>)',
          900: 'oklch(0.205 0 0 / <alpha-value>)',
          950: 'oklch(0.145 0 0 / <alpha-value>)',
        },
        // Success/error states - muted versions
        success: {
          50: 'oklch(0.982 0.018 153 / <alpha-value>)',
          100: 'oklch(0.962 0.043 153 / <alpha-value>)',
          200: 'oklch(0.925 0.081 153 / <alpha-value>)',
          300: 'oklch(0.871 0.136 153 / <alpha-value>)',
          400: 'oklch(0.8 0.182 153 / <alpha-value>)',
          500: 'oklch(0.627 0.161 153 / <alpha-value>)',
          600: 'oklch(0.527 0.135 153 / <alpha-value>)',
          700: 'oklch(0.448 0.108 153 / <alpha-value>)',
          800: 'oklch(0.393 0.09 153 / <alpha-value>)',
          900: 'oklch(0.266 0.063 153 / <alpha-value>)',
        },
        error: {
          50: 'oklch(0.971 0.013 27 / <alpha-value>)',
          100: 'oklch(0.936 0.031 27 / <alpha-value>)',
          200: 'oklch(0.885 0.059 27 / <alpha-value>)',
          300: 'oklch(0.808 0.103 27 / <alpha-value>)',
          400: 'oklch(0.711 0.166 27 / <alpha-value>)',
          500: 'oklch(0.577 0.215 27 / <alpha-value>)',
          600: 'oklch(0.505 0.19 27 / <alpha-value>)',
          700: 'oklch(0.444 0.161 27 / <alpha-value>)',
          800: 'oklch(0.396 0.133 27 / <alpha-value>)',
          900: 'oklch(0.258 0.089 27 / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.625rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.1' }],
        '6xl': ['3.75rem', { lineHeight: '1.1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
      },
      borderRadius: {
        'sm': '0.125rem',
        'md': '0.25rem',
        'lg': '0.375rem',
        'xl': '0.5rem',
        '2xl': '0.75rem',
        '3xl': '1rem',
      },
      boxShadow: {
        // Softer than Tailwind defaults — the editorial theme keeps elevation subtle.
        'sm': '0 1px 3px 0 oklch(0 0 0 / 0.05), 0 1px 2px -1px oklch(0 0 0 / 0.05)',
        'md': '0 4px 6px -1px oklch(0 0 0 / 0.05), 0 2px 4px -2px oklch(0 0 0 / 0.05)',
        'lg': '0 10px 15px -3px oklch(0 0 0 / 0.05), 0 4px 6px -4px oklch(0 0 0 / 0.05)',
        'xl': '0 20px 25px -5px oklch(0 0 0 / 0.08), 0 8px 10px -6px oklch(0 0 0 / 0.05)',
        'surface': '0 0 0 1px oklch(0 0 0 / 0.06), 0 1px 2px -1px oklch(0 0 0 / 0.06), 0 2px 4px oklch(0 0 0 / 0.04)',
        'surface-hover': '0 0 0 1px oklch(0 0 0 / 0.08), 0 1px 2px -1px oklch(0 0 0 / 0.08), 0 2px 4px oklch(0 0 0 / 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.98)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};

export default config;
