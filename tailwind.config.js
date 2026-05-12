/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Aethos OS — Soulful Tech Palette
        aether: {
          50: '#E8EAF6',
          100: '#C5CAE9',
          200: '#9FA8DA',
          300: '#7986CB',
          400: '#5C6BC0',
          500: '#3F51B5',
          600: '#2A3D8F',
          700: '#1A2A6C',  // PRIMARY — Aether Blue
          800: '#111C4E',
          900: '#0A1236',
        },
        soul: {
          50: '#FDF8E8',
          100: '#FAF0C8',
          200: '#F5E08F',
          300: '#E8CC6E',
          400: '#D4AF37',  // ACCENT — Soul Gold
          500: '#B8960F',
          600: '#9A7D0A',
          700: '#7C6408',
          800: '#5E4B06',
          900: '#403204',
        },
        warm: {
          50: '#F5F5F0',
          100: '#EDEDEA',
          200: '#D8D8D2',
          300: '#B8B8B0',
          400: '#8A8A82',
          500: '#6B6B63',
          600: '#4A4A44',
          700: '#333330',
          800: '#1F1F1D',
          900: '#121210',
        },
        // Semantic colors for bandwidth metrics
        spirit: {
          flow: '#4CAF50',
          high: '#D4AF37',
          caution: '#FF9800',
          critical: '#E53935',
        },
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'Georgia', 'serif'],
        ui: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      backgroundImage: {
        'aether-gradient': 'linear-gradient(135deg, #0A1236 0%, #1A2A6C 50%, #2A3D8F 100%)',
        'soul-shimmer': 'linear-gradient(135deg, #D4AF37 0%, #E8CC6E 50%, #D4AF37 100%)',
        'soulful-dark': 'linear-gradient(135deg, #121210 0%, #1A2A6C 100%)',
      },
      boxShadow: {
        'aether': '0 4px 24px -4px rgba(26, 42, 108, 0.3)',
        'soul-glow': '0 0 20px rgba(212, 175, 55, 0.15)',
      },
    },
  },
  plugins: [],
}
