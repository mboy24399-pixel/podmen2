import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/navigation/Sidebar";
import Header from "@/components/navigation/Header";
import MobileNav from "@/components/navigation/MobileNav";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthProvider } from "@/context/AuthContext";

const inter=Inter({subsets:["latin"]});
export const metadata:Metadata={title:"Podmen X — Music & Podcasts",description:"A premium music and podcast streaming platform."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" className="dark"><body className={`${inter.className} min-h-screen bg-dark text-white selection:bg-accent selection:text-dark`}><AuthProvider><ToastProvider><div className="flex min-h-screen"><Sidebar/><div className="flex min-w-0 flex-1 flex-col"><Header/><main className="flex-1 overflow-y-auto pb-24 md:pb-8">{children}</main></div></div><MobileNav/></ToastProvider></AuthProvider></body></html>}
