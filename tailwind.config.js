/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Golos Text"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        '13': ['0.8125rem', { lineHeight: '1.25rem' }],
        '15': ['0.9375rem', { lineHeight: '1.375rem' }],
      },
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        crm: {
          bg: '#f8f9fa',
          sidebar: '#ffffff',
          border: '#e2e8f0',
          heading: '#1f2020',
          body: '#707070',
          muted: '#9d9d9d',
          light: '#f7f8f9',
        },
      },
      boxShadow: {
        'crm': '0px 4px 4px 0px rgba(219, 219, 219, 0.25)',
        'crm-sm': '0px 4px 74px 0px rgba(208, 208, 208, 0.25)',
        'crm-lg': '0px 4.4px 12px -1px rgba(222, 222, 222, 0.36)',
        'crm-card': '0 0.75rem 1.5rem rgba(18, 38, 63, 0.03)',
      },
      width: {
        'sidebar': '240px',
        'sidebar-sm': '70px',
      },
      height: {
        'topbar': '56px',
      },
    },
  },
  plugins: [],
}

