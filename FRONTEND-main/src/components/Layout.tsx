import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/authUse'

const navItems = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: 'dashboard',
  },
  {
    path: '/new-order',
    label: 'New Order',
    icon: 'add_circle',
  },
  {
    path: '/pending',
    label: 'Pending',
    icon: 'pending_actions',
  },
  {
    path: '/history',
    label: 'History',
    icon: 'history',
  },
  {
    path: '/collection',
    label: 'Collection',
    icon: 'account_balance_wallet',
  },
  {
    path: '/expenses',
    label: 'Extra Expense',
    icon: 'receipt_long',
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: 'settings',
  },
]

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { logout, username } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        h-screen w-64 bg-slate-50/80 backdrop-blur-md
        flex flex-col py-8 transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>

        {/* Logo */}
        <div className="px-6 mb-10">
          <h1 className="text-lg font-extrabold tracking-tighter text-sky-700">
            Horbax
          </h1>
          <p className="text-[10px] text-outline uppercase tracking-widest mt-1">
            Concierge Admin
          </p>
        </div>

        {/* Nav Items */}
        <nav className="flex-grow flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 py-3 px-6 font-medium text-sm transition-all duration-200
                ${isActive
                  ? 'text-sky-600 border-l-4 border-sky-600 bg-sky-50'
                  : 'text-slate-500 hover:bg-slate-100 border-l-4 border-transparent'
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px]">
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="mt-auto px-2">
          <div className="px-4 py-2 mb-2">
            <p className="text-xs font-bold text-on-surface capitalize">{username}</p>
            <p className="text-[10px] text-outline uppercase tracking-wider">Admin</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 text-slate-500 py-3 px-6 hover:bg-slate-100 rounded-lg transition-all duration-200 text-sm font-medium"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Mobile Top Bar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-outline hover:bg-slate-100"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h1 className="text-lg font-extrabold tracking-tighter text-sky-700">
            Horbax
          </h1>
          <div className="w-9" />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout