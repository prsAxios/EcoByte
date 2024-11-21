"use client"

import { useState, useEffect } from "react"
import { Inter } from 'next/font/google'
import "./globals.css"
import Header from "@/components/Header"
import Sidebar from "@/components/Sidebar"
import 'leaflet/dist/leaflet.css'
import { Toaster } from 'react-hot-toast'
import { getAvailableRewards, getUserByEmail } from '@/utils/db/actions'
import AdminPanel from "@/components/AdminPanel" // import AdminPanel

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [isAdminPanel, setIsAdminPanel] = useState(false)

  useEffect(() => {
    // Check if the current path is '/panel'
    if (window.location.pathname === "/panel") {
      setIsAdminPanel(true)
    }

    const fetchTotalEarnings = async () => {
      try {
        const userEmail = localStorage.getItem('userEmail')
        if (userEmail) {
          const user = await getUserByEmail(userEmail)
          console.log('user from layout', user)
          
          if (user) {
            const availableRewards = await getAvailableRewards(user.id) as any
            console.log('availableRewards from layout', availableRewards)
            setTotalEarnings(availableRewards)
          }
        }
      } catch (error) {
        console.error('Error fetching total earnings:', error)
      }
    }

    fetchTotalEarnings()
  }, [])

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          {/* Conditionally render Header and Sidebar */}
          { !isAdminPanel && (
            <>
              <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} totalEarnings={totalEarnings} />
              <div className="flex flex-1">
                <Sidebar open={sidebarOpen} />
                <main className="flex-1 p-4 lg:p-8 ml-0 lg:ml-64 transition-all duration-300">
                  {children}
                </main>
              </div>
            </>
          )}
          
          {/* Render AdminPanel when the path is '/panel' */}
          { isAdminPanel && <AdminPanel /> }

        </div>
        <Toaster />
      </body>
    </html>
  )
}
