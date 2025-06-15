
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
			},
			colors: {
				// New sophisticated color system
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				
				// Strategic dark accents
				'dark-accent': {
					900: '#1F2937',
					800: '#374151',
					700: '#4B5563',
					600: '#6B7280',
				},
				
				// Premium light grays
				'light-gray': {
					50: '#FAFAFA',
					100: '#F5F5F5',
					200: '#E5E5E5',
					300: '#D4D4D4',
				},
				
				// Fintech professional palette
				'fintech': {
					blue: {
						50: '#EFF6FF',
						100: '#DBEAFE',
						500: '#3B82F6',
						600: '#2563EB',
						700: '#1D4ED8',
					},
					green: {
						50: '#F0FDF4',
						100: '#DCFCE7',
						500: '#22C55E',
						600: '#16A34A',
						700: '#15803D',
					},
					purple: {
						50: '#FAF5FF',
						100: '#F3E8FF',
						500: '#A855F7',
						600: '#9333EA',
						700: '#7C3AED',
					},
					orange: {
						50: '#FFF7ED',
						100: '#FFEDD5',
						500: '#F97316',
						600: '#EA580C',
						700: '#C2410C',
					}
				},
				
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			boxShadow: {
				'soft': '0 2px 8px -2px rgba(0, 0, 0, 0.08)',
				'card': '0 4px 16px -4px rgba(0, 0, 0, 0.1)',
				'elevated': '0 8px 32px -8px rgba(0, 0, 0, 0.12)',
			},
			spacing: {
				'18': '4.5rem',
				'88': '22rem',
			},
			lineHeight: {
				'relaxed-web': '1.65',
				'loose-web': '1.75',
			},
			letterSpacing: {
				'wide-web': '0.01em',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'slide-in': {
					'0%': {
						opacity: '0',
						transform: 'translateX(-10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateX(0)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'slide-in': 'slide-in 0.3s ease-out',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
