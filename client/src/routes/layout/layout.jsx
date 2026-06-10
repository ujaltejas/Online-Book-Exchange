import Navbar from "../../components/navbar/Navbar"
import { Outlet } from 'react-router-dom'

function Layout() {
    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <main>
                <Outlet />
            </main>
        </div>
    )
}

export default Layout