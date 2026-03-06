import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import './AdminLayout.css'

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="admin-layout">
            <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="admin-layout__main">
                <Topbar onMenuClick={() => setSidebarOpen(true)} />
                <main className="admin-layout__content">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
