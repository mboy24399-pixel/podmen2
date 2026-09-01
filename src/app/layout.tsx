import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AppShell from '@/components/navigation/AppShell';
import { ToastProvider } from '@/components/ui/Toast';
import { AuthProvider } from '@/context/AuthContext';
import { PlayerProvider } from '@/components/player/PlayerProvider';
import GlobalPlayer from '@/components/player/GlobalPlayer';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import ThemeControls from '@/components/theme/ThemeControls';

const inter=Inter({subsets:['latin']});
export const metadata:Metadata={title:'Podmen X — Music & Podcasts',description:'A live music and podcast streaming platform.',applicationName:'Podmen X',icons:{icon:'/icon.svg',apple:'/icon.svg'},manifest:'/manifest.webmanifest'};

export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" className="dark"><body className={`${inter.className} min-h-screen bg-dark text-white selection:bg-accent selection:text-dark`}><ThemeProvider><AuthProvider><ToastProvider><PlayerProvider><AppShell>{children}</AppShell><GlobalPlayer/><ThemeControls/></PlayerProvider></ToastProvider></AuthProvider></ThemeProvider></body></html>}
