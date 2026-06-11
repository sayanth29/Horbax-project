import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import type { Order, CollectionSummary } from '../types/types'

interface DashboardData {
  summary: CollectionSummary
  orders: Order[]
}

const statusConfig: Record<string, { color: string; dot: string; label: string }> = {
  pending:   { color: 'bg-amber-100 text-amber-700',     dot: 'bg-amber-400',   label: 'Pending'   },
  ready:     { color: 'bg-sky-100 text-sky-700',         dot: 'bg-sky-400',     label: 'Ready'     },
  completed: { color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', label: 'Completed' },
}
const paymentConfig: Record<string, { color: string; label: string }> = {
  cash_pending: { color: 'bg-orange-100 text-orange-700',   label: 'Cash Pending' },
  cash_paid:    { color: 'bg-emerald-100 text-emerald-700', label: 'Paid'         },
  upi:          { color: 'bg-sky-100 text-sky-700',         label: 'UPI'          },
  upi_cash:     { color: 'bg-purple-100 text-purple-700',   label: 'UPI + Cash'   },
}

const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null)
  const [totalCustomers, setTotalCustomers] = useState(0)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [collectionRes, customersRes] = await Promise.all([
          api.get<DashboardData>('/collection/today'),
          api.get('/customers'),
        ])
        setData(collectionRes.data)
        setTotalCustomers(customersRes.data.length)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  const summary = data?.summary
  const todayOrders = data?.orders || []

  const statCards = [
    {
      label: "Today's Orders",
      value: todayOrders.length,
      icon: 'shopping_basket',
      iconBg: 'bg-primary-fixed-dim',
      iconColor: 'text-primary',
    },
    {
      label: 'Pending',
      value: summary?.pendingOrders ?? 0,
      icon: 'hourglass_empty',
      iconBg: 'bg-secondary-container',
      iconColor: 'text-secondary',
    },
    {
      label: "Today's Collection",
      value: `₹${summary?.totalCollected ?? 0}`,
      icon: 'account_balance_wallet',
      iconBg: 'bg-tertiary-fixed-dim',
      iconColor: 'text-tertiary',
    },
    {
      label: 'Total Customers',
      value: totalCustomers,
      icon: 'group_add',
      iconBg: 'bg-sky-100',
      iconColor: 'text-sky-700',
    },
  ]

  return (
    <div className=" p-6 sm:p-6 max-w-7xl mx-auto space-y-8">

      {/* Page Header */}
      <section className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-on-surface leading-none">
            Dashboard
          </h2>
          <p className="text-outline text-base font-medium">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <button
          onClick={() => navigate('/new-order')}
          className="flex items-center gap-2 bg-gradient-to-br from-primary to-primary-container text-white px-5 py-3 rounded-full font-semibold text-sm shadow-md hover:opacity-90 transition-opacity w-fit"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Create New Order
        </button>
      </section>

      {/* Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_12px_32px_rgba(19,27,46,0.06)] space-y-4 hover:bg-primary-fixed transition-colors duration-300"
          >
            <div className={`w-12 h-12 ${card.iconBg} rounded-lg flex items-center justify-center ${card.iconColor}`}>
              <span className="material-symbols-outlined">{card.icon}</span>
            </div>
            <div>
              <p className="text-outline text-xs font-medium uppercase tracking-wider">
                {card.label}
              </p>
              <h3 className="text-3xl font-extrabold text-on-surface mt-1">
                {card.value}
              </h3>
            </div>
          </div>
        ))}
      </section>

      {/* Recent Orders */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-on-surface tracking-tight">
          Recent Orders
        </h3>

        <div className="bg-surface-container-lowest rounded-xl shadow-[0px_12px_32px_rgba(19,27,46,0.06)] overflow-hidden p-2">

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-outline font-semibold text-xs uppercase tracking-widest border-b border-slate-50">
                  {['Order ID', 'Customer', 'Items', 'Amount', 'Payment', 'Status', 'Delivery'].map(h => (
                    <th key={h} className="px-6 py-4 font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {todayOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-outline text-sm">
                      No orders today yet
                    </td>
                  </tr>
                ) : (
                  todayOrders.slice(0, 10).map((order) => {
                    const sc = statusConfig[order.status]
                    const pc = paymentConfig[order.paymentMethod]
                    return (
                      <tr key={order._id} className="hover:bg-surface-container-low transition-colors">
                        <td className="px-6 py-5 font-bold text-primary text-sm">
                          #{order.orderId}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                              {getInitials(order.customerName)}
                            </div>
                            <p className="text-sm font-semibold text-on-surface">
                              {order.customerName}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm text-outline">
                          {order.items.map(i => `${i.qty} ${i.cloth}`).join(', ')}
                        </td>
                        <td className="px-6 py-5 text-sm font-bold text-on-surface">
                          ₹{order.total}
                        </td>
                        <td className="px-6 py-5">
                          <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-tighter ${pc.color}`}>
                            {pc.label}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${sc.dot} ${order.status === 'pending' ? 'animate-pulse' : ''}`} />
                            <span className={`text-sm font-medium ${sc.color.split(' ')[1]}`}>
                              {sc.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm text-outline font-medium">
                          {order.deliveryDate || '—'}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-slate-50">
            {todayOrders.length === 0 ? (
              <p className="text-center py-10 text-outline text-sm">
                No orders today yet
              </p>
            ) : (
              todayOrders.slice(0, 10).map((order) => {
                const sc = statusConfig[order.status]
                const pc = paymentConfig[order.paymentMethod]
                return (
                  <div key={order._id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary text-sm">#{order.orderId}</span>
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase ${sc.color}`}>
                        {sc.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                        {getInitials(order.customerName)}
                      </div>
                      <p className="font-semibold text-sm text-on-surface">{order.customerName}</p>
                    </div>
                    <p className="text-xs text-outline">
                      {order.items.map(i => `${i.qty} ${i.cloth}`).join(', ')}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-on-surface">₹{order.total}</span>
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase ${pc.color}`}>
                        {pc.label}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Dashboard