import { useEffect, useState } from 'react'
import api from '../api/axios'
import type { Order } from '../types/types'
import PrintBill from '../components/PrintBill'

const statusConfig: Record<string, { color: string; label: string }> = {
  pending:   { color: 'bg-amber-100 text-amber-700',     label: 'Pending'   },
  ready:     { color: 'bg-sky-100 text-sky-700',         label: 'Ready'     },
  completed: { color: 'bg-emerald-100 text-emerald-700', label: 'Completed' },
}

const paymentConfig: Record<string, { color: string; label: string }> = {
  cash_pending: { color: 'bg-orange-100 text-orange-700', label: 'Cash Pending' },
  cash_paid:    { color: 'bg-purple-100 text-purple-700', label: 'Cash Paid'    },
  upi:          { color: 'bg-blue-100 text-blue-700',     label: 'UPI'          },
  upi_cash:     { color: 'bg-teal-100 text-teal-700',     label: 'UPI + Cash'   },
}

const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

const History = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [printOrder, setPrintOrder] = useState<Order | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpand = (id: string) =>
    setExpandedId(prev => (prev === id ? null : id))

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get<Order[]>('/orders')
        setOrders(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  // Filter orders
  const filtered = orders.filter(o => {
    const matchSearch =
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.phone.includes(search) ||
      o.orderId.toLowerCase().includes(search.toLowerCase())

    const matchStatus = statusFilter === 'all' || o.status === statusFilter

    return matchSearch && matchStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-on-surface">
          Order History
        </h2>
        <p className="text-outline text-base font-medium mt-1">
          All orders — search and filter
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">

        {/* Search */}
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, phone or order ID..."
            className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-primary/40 text-sm font-medium outline-none transition-all shadow-sm"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'ready', 'completed'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${
                statusFilter === s
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white text-outline border border-slate-200 hover:border-primary/40'
              }`}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-outline mb-4 font-medium">
        Showing {filtered.length} of {orders.length} orders
      </p>

      {/* Desktop Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-outline/40">
            search_off
          </span>
          <p className="text-outline mt-3 font-medium">No orders found</p>
        </div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Order ID', 'Customer', 'Items', 'Amount', 'Payment', 'Delivery', 'Status', 'Date', ''].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-outline">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(order => {
                  const sc = statusConfig[order.status]
                  const pc = paymentConfig[order.paymentMethod]
                  const isExpanded = expandedId === order._id
                  return (
                    <>
                      <tr key={order._id} className="hover:bg-surface-container-low transition-colors">
                        <td className="px-5 py-4">
                          <button
                            onClick={() => toggleExpand(order._id)}
                            className="font-extrabold text-primary hover:underline cursor-pointer flex items-center gap-1"
                          >
                            #{order.orderId}
                            <span className={`material-symbols-outlined text-sm transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                              expand_more
                            </span>
                          </button>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                              {getInitials(order.customerName)}
                            </div>
                            <div>
                              <p className="font-semibold text-on-surface text-sm">
                                {order.customerName}
                              </p>
                              <p className="text-[11px] text-outline">{order.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-outline text-xs max-w-[160px]">
                          {order.items.map(i => `${i.qty}× ${i.cloth}`).join(', ')}
                        </td>
                        <td className="px-5 py-4 font-bold text-on-surface">
                          ₹{order.total}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${pc.color}`}>
                            {pc.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 w-fit ${
                            order.deliveryType === 'home_delivery'
                              ? 'bg-blue-50 text-blue-600'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            <span className="material-symbols-outlined text-xs">
                              {order.deliveryType === 'home_delivery' ? 'local_shipping' : 'store'}
                            </span>
                            {order.deliveryType === 'home_delivery' ? 'Home' : 'Takeaway'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${sc.color}`}>
                            {sc.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-outline text-xs">
                          {new Date(order.createdAt).toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => setPrintOrder(order)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors text-xs font-bold"
                          >
                            <span className="material-symbols-outlined text-sm">print</span>
                            Bill
                          </button>
                        </td>
                      </tr>
                      {/* Expanded payment detail row */}
                      {isExpanded && (
                        <tr key={`${order._id}-detail`} className="bg-slate-50/70">
                          <td colSpan={9} className="px-5 py-3">
                            <div className="flex items-center gap-6 pl-2">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-500 text-base">account_balance</span>
                                <span className="text-xs font-semibold text-slate-500">UPI:</span>
                                <span className="text-sm font-bold text-blue-600">₹{order.upiAmount || 0}</span>
                              </div>
                              <div className="w-px h-5 bg-slate-200" />
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-emerald-500 text-base">payments</span>
                                <span className="text-xs font-semibold text-slate-500">Cash:</span>
                                <span className="text-sm font-bold text-emerald-600">₹{order.cashAmount || 0}</span>
                              </div>
                              <div className="w-px h-5 bg-slate-200" />
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-500">Total:</span>
                                <span className="text-sm font-bold text-on-surface">₹{order.total}</span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filtered.map(order => {
              const sc = statusConfig[order.status]
              const pc = paymentConfig[order.paymentMethod]
              return (
                <div key={order._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    <button
                      onClick={() => toggleExpand(order._id)}
                      className="font-extrabold text-primary flex items-center gap-1"
                    >
                      #{order.orderId}
                      <span className={`material-symbols-outlined text-sm transition-transform ${expandedId === order._id ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    </button>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${sc.color}`}>
                      {sc.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                      {getInitials(order.customerName)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{order.customerName}</p>
                      <p className="text-xs text-outline">{order.phone}</p>
                    </div>
                  </div>
                  <p className="text-xs text-outline mb-2">
                    {order.items.map(i => `${i.qty}× ${i.cloth}`).join(', ')}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-on-surface">₹{order.total}</span>
                    <div className="flex gap-2 items-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${pc.color}`}>
                        {pc.label}
                      </span>
                      <button
                        onClick={() => setPrintOrder(order)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold"
                      >
                        <span className="material-symbols-outlined text-sm">print</span>
                      </button>
                    </div>
                  </div>
                  {/* Expanded payment detail */}
                  {expandedId === order._id && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-blue-500 text-base">account_balance</span>
                        <span className="text-[11px] font-semibold text-slate-500">UPI:</span>
                        <span className="text-xs font-bold text-blue-600">₹{order.upiAmount || 0}</span>
                      </div>
                      <div className="w-px h-4 bg-slate-200" />
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-emerald-500 text-base">payments</span>
                        <span className="text-[11px] font-semibold text-slate-500">Cash:</span>
                        <span className="text-xs font-bold text-emerald-600">₹{order.cashAmount || 0}</span>
                      </div>
                    </div>
                  )}
                  <p className="text-[11px] text-outline mt-2">
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Print Bill Modal */}
      {printOrder && (
        <PrintBill
          order={printOrder}
          onClose={() => setPrintOrder(null)}
        />
      )}
    </div>
  )
}

export default History