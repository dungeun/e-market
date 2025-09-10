/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    // SectionLayout 그리드 클래스들
    'grid-cols-1',
    'grid-cols-2',
    'grid-cols-3',
    'grid-cols-4',
    'grid-cols-5',
    'grid-cols-6',
    'md:grid-cols-1',
    'md:grid-cols-2',
    'md:grid-cols-3',
    'md:grid-cols-4',
    'md:grid-cols-5',
    'md:grid-cols-6',
    'lg:grid-cols-1',
    'lg:grid-cols-2',
    'lg:grid-cols-3',
    'lg:grid-cols-4',
    'lg:grid-cols-5',
    'lg:grid-cols-6',
    // 스켈레톤 및 애니메이션 클래스
    'animate-pulse',
    'bg-gray-200',
    'bg-gray-800',
    // 테마 관련 클래스들
    'bg-black',
    'bg-white',
    'text-white',
    'text-gray-900',
    'text-gray-300',
    'text-gray-400',
    'text-gray-500',
    'text-gray-600',
    // 버튼 상태 클래스들
    'hover:bg-red-600',
    'hover:bg-red-700',
    'hover:bg-gray-800',
    'hover:bg-gray-600',
    'hover:bg-gray-200',
    'hover:text-white',
    'border-red-600',
    'text-red-600',
    'bg-red-600',
    'bg-red-700'
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
      },
    },
  },
  plugins: [
    // Scrollbar hide utility
    function({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          /* IE and Edge */
          '-ms-overflow-style': 'none',
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }
      })
    }
  ],
}