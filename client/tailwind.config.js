/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F5F8FC',
        card: '#FFFFFF',
        primary: {
          DEFAULT: '#1769F5',
          hover: '#0F55D8',
          surface: '#EAF2FF',
          subtle: '#F0F6FF'
        },
        navy: {
          900: '#12264A',
          800: '#1B3566',
          700: '#23447F'
        },
        body: '#334155',
        secondary: '#64748B',
        border: '#DCE5F1',
        success: {
          DEFAULT: '#15803D',
          surface: '#ECFDF5',
          border: '#A7F3D0'
        },
        warning: {
          DEFAULT: '#B45309',
          surface: '#FFFBEB',
          border: '#FDE68A'
        },
        danger: {
          DEFAULT: '#DC2626',
          surface: '#FEF2F2',
          border: '#FECACA'
        }
      },
      borderRadius: {
        'card': '16px',
        'input': '10px'
      },
      boxShadow: {
        'card': '0 2px 10px rgba(18, 38, 74, 0.04), 0 1px 3px rgba(18, 38, 74, 0.02)',
        'card-hover': '0 8px 24px rgba(23, 105, 245, 0.08), 0 2px 6px rgba(18, 38, 74, 0.04)',
        'selected': '0 0 0 2px #1769F5, 0 8px 20px rgba(23, 105, 245, 0.12)'
      }
    },
  },
  plugins: [],
}

