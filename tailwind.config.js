/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0B1F8F',
          dark: '#081670',
        },
        blue: {
          DEFAULT: '#2F4BDB',
          dark: '#243bb0',
          tint: '#E3E8FF',
        },
        orange: {
          DEFAULT: '#E08A00',
          dark: '#C97A00',
          tint: '#FFF7ED',
        },
        green: {
          DEFAULT: '#16A34A',
          tint: '#F0FDF4',
        },
        red: {
          DEFAULT: '#DC2626',
          tint: '#FEF2F2',
        },
        app: '#EFF1FD',
        card: '#FFFFFF',
        'soft-blue': '#E3E8FF',
        border: '#E5E8F5',
        'text-heading': '#0A1450',
        'text-muted': '#64748B',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(11, 31, 143, 0.05), 0 2px 6px -1px rgba(11, 31, 143, 0.03)',
        'soft-md': '0 10px 25px -3px rgba(11, 31, 143, 0.08), 0 4px 10px -2px rgba(11, 31, 143, 0.04)',
        'soft-lg': '0 20px 30px -4px rgba(11, 31, 143, 0.1), 0 8px 12px -3px rgba(11, 31, 143, 0.05)',
      }
    },
  },
  plugins: [],
}

