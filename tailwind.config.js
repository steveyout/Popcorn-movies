/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  theme: {
    extend: {
      colors: {
        primary: {
          popcorn: '#8B5CF6',
          bingebox: '#06B6D4',
        },
        background: {
          dark: '#050508',
          'dark-secondary': '#0b0c16',
          'glass-dark': 'rgba(5, 5, 8, 0.6)',
        },
        glass: {
          violet: 'rgba(139, 92, 246, 0.1)',
          emerald: 'rgba(16, 185, 129, 0.1)',
          rose: 'rgba(244, 63, 94, 0.1)',
          cyan: 'rgba(6, 182, 212, 0.1)',
          amber: 'rgba(245, 158, 11, 0.1)',
        },
        border: {
          glass: 'rgba(255, 255, 255, 0.1)',
        },
      },

      backgroundImage: {
        'radial-dark': 'radial-gradient(circle at 0% 0%, #1a1a2e 0%, #050508 50%), radial-gradient(circle at 100% 100%, #2d1b4d 0%, #050508 50%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      },

      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        '3xl': '32px',
      },

      animation: {
        shimmer: 'shimmer 1.8s infinite ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },

      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },

      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },

  plugins: [],
};
