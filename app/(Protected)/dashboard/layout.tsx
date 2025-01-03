import { Navbar } from "@/components/Navbar"
import { ReactNode } from "react"

export default function DashboardLayout({ children }:{children:ReactNode}) {
    return (
      <div className="flex flex-col h-screen">
        <Navbar />
        {children}
      </div>
    )
}