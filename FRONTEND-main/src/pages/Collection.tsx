import { useEffect, useState, useCallback } from 'react'
import api from '../api/axios'
import type { Order, CollectionSummary } from '../types/types'

interface CollectionData {
  summary: CollectionSummary
  orders: Order[]
}

type TabType = 'today' | 'month' | 'all' | 'date' | 'range'

const paymentConfig: Record<string, { color: string; label: string }> = {
  cash_pending: { color: 'bg-orange-100 text-orange-700', label: 'Cash Pending' },
  cash_paid:    { color: 'bg-purple-100 text-purple-700', label: 'Cash Paid'    },
  upi:          { color: 'bg-blue-100 text-blue-700',     label: 'UPI'          },
  upi_cash:     { color: 'bg-teal-100 text-teal-700',     label: 'UPI + Cash'   },
}

const Collection = () => {
  const [activeTab, setActiveTab]     = useState<TabType>('today')
  const [data, setData]               = useState<CollectionData | null>(null)
  const [loading, setLoading]         = useState(true)
  const [selectedDate, setSelectedDate] = useState('')
  const [fromDate, setFromDate]       = useState('')
  const [toDate, setToDate]           = useState('')

  const fetchCollection = useCallback(async (tab: TabType, date?: string) => {
    setLoading(true)
    try {
      let url = `/collection/${tab}`

      if (tab === 'date' && date) {
        url = `/collection/date/${date}`
      }
      if (tab === 'range' && fromDate && toDate) {
        url = `/collection/range?from=${fromDate}&to=${toDate}`
      }

      const { data } = await api.get<CollectionData>(url)
      setData(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [fromDate, toDate])

  useEffect(() => {
    if (activeTab === 'date' && !selectedDate) return
    if (activeTab === 'range' && (!fromDate || !toDate)) return

    if (activeTab === 'date') {
      fetchCollection('date', selectedDate)
    } else {
      fetchCollection(activeTab)
    }
  }, [activeTab, selectedDate, fromDate, toDate, fetchCollection])

  const summary = data?.summary
  const orders  = data?.orders || []

  const summaryCards = [
    { label: 'Total Collected',   value: `₹${summary?.totalCollected ?? 0}`,  icon: 'account_balance_wallet', bg: 'bg-emerald-50', color: 'text-emerald-600', iconColor: 'text-emerald-500' },
    { label: 'UPI',               value: `₹${summary?.totalUPI ?? 0}`,         icon: 'smartphone',             bg: 'bg-sky-50',     color: 'text-sky-600',     iconColor: 'text-sky-500'     },
    { label: 'Cash',              value: `₹${summary?.totalCash ?? 0}`,        icon: 'payments',               bg: 'bg-purple-50',  color: 'text-purple-600',  iconColor: 'text-purple-500'  },
    { label: 'Pending',           value: `₹${summary?.totalPending ?? 0}`,     icon: 'hourglass_empty',        bg: 'bg-amber-50',   color: 'text-amber-600',   iconColor: 'text-amber-500'   },
    { label: 'Completed Orders',  value: summary?.completedOrders ?? 0,        icon: 'check_circle',           bg: 'bg-emerald-50', color: 'text-emerald-600', iconColor: 'text-emerald-500' },
    { label: 'Pending Orders',    value: summary?.pendingOrders ?? 0,          icon: 'pending_actions',        bg: 'bg-amber-50',   color: 'text-amber-600',   iconColor: 'text-amber-500'   },
  ]

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-on-surface">
          Collection
        </h2>
        <p className="text-outline text-base font-medium mt-1">
          Revenue breakdown and payment summary
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap items-center">
        {[
          { key: 'today', label: 'Today',      icon: 'today'          },
          { key: 'month', label: 'This Month', icon: 'calendar_month' },
          { key: 'all',   label: 'All Time',   icon: 'history'        },
          { key: 'date',  label: 'Pick Date',  icon: 'calendar_today' },
          { key: 'range', label: 'Date Range', icon: 'date_range'     },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabType)}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === tab.key
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white text-outline border border-slate-200 hover:border-primary/40'
            }`}
          >
            <span className="material-symbols-outlined text-lg">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Single Date Picker */}
      {activeTab === 'date' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-4 flex items-center gap-4 flex-wrap">
          <span className="material-symbols-outlined text-primary">calendar_today</span>
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-outline uppercase tracking-wider">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-surface-container-low text-sm font-bold text-slate-700 outline-none focus:border-primary/40 transition-all"
            />
          </div>
          {selectedDate && (
            <p className="text-sm font-bold text-primary">
              {new Date(selectedDate).toLocaleDateString('en-IN', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}
            </p>
          )}
          {!selectedDate && (
            <p className="text-sm text-outline flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">info</span>
              Please select a date
            </p>
          )}
        </div>
      )}

      {/* Date Range Picker */}
      {activeTab === 'range' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="material-symbols-outlined text-primary">date_range</span>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-outline uppercase tracking-wider">From</label>
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                max={toDate || new Date().toISOString().split('T')[0]}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-surface-container-low text-sm font-bold text-slate-700 outline-none focus:border-primary/40 transition-all"
              />
            </div>

            <span className="material-symbols-outlined text-outline mt-4">arrow_forward</span>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-outline uppercase tracking-wider">To</label>
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                min={fromDate}
                max={new Date().toISOString().split('T')[0]}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-surface-container-low text-sm font-bold text-slate-700 outline-none focus:border-primary/40 transition-all"
              />
            </div>
          </div>

          {fromDate && toDate ? (
            <p className="text-sm font-bold text-primary mt-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              {new Date(fromDate).toLocaleDateString('en-IN')} → {new Date(toDate).toLocaleDateString('en-IN')}
            </p>
          ) : (
            <p className="text-sm text-outline mt-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">info</span>
              Please select both From and To dates
            </p>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {summaryCards.map(card => (
              <div key={card.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <span className={`material-symbols-outlined ${card.iconColor}`}>{card.icon}</span>
                </div>
                <p className="text-[11px] font-bold text-outline uppercase tracking-wider mb-1">{card.label}</p>
                <p className={`text-2xl font-extrabold ${card.color}`}>{card.value}</p>
              </div>
            ))}
          </div>

          {/* Payment Breakdown Bar */}
          {(summary?.totalCollected ?? 0) > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
              <p className="text-sm font-bold text-on-surface mb-3">Payment Breakdown</p>
              <div className="flex rounded-full overflow-hidden h-4 mb-3">
                {(summary?.totalUPI ?? 0) > 0 && (
                  <div className="bg-sky-400 transition-all" style={{ width: `${((summary?.totalUPI ?? 0) / (summary?.totalCollected ?? 1)) * 100}%` }} />
                )}
                {(summary?.totalCash ?? 0) > 0 && (
                  <div className="bg-purple-400 transition-all" style={{ width: `${((summary?.totalCash ?? 0) / (summary?.totalCollected ?? 1)) * 100}%` }} />
                )}
                {(summary?.totalPending ?? 0) > 0 && (
                  <div className="bg-amber-300 transition-all" style={{ width: `${((summary?.totalPending ?? 0) / ((summary?.totalCollected ?? 0) + (summary?.totalPending ?? 0))) * 100}%` }} />
                )}
              </div>
              <div className="flex gap-4 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs font-medium text-outline">
                  <span className="w-3 h-3 rounded-full bg-sky-400" /> UPI ₹{summary?.totalUPI ?? 0}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-outline">
                  <span className="w-3 h-3 rounded-full bg-purple-400" /> Cash ₹{summary?.totalCash ?? 0}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-outline">
                  <span className="w-3 h-3 rounded-full bg-amber-300" /> Pending ₹{summary?.totalPending ?? 0}
                </div>
              </div>
            </div>
          )}

          {/* Orders Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-on-surface">Order Breakdown</h3>
            </div>

            {orders.length === 0 ? (
              <div className="p-12 text-center">
                <span className="material-symbols-outlined text-5xl text-outline/40">receipt_long</span>
                <p className="text-outline mt-3 font-medium">No orders for this period</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-50">
                        {['Order ID', 'Customer', 'Amount', 'Payment', 'Delivery', 'Status', 'Date'].map(h => (
                          <th key={h} className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-outline">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {orders.map(order => {
                        const pc = paymentConfig[order.paymentMethod]
                        return (
                          <tr key={order._id} className="hover:bg-surface-container-low transition-colors">
                            <td className="px-5 py-4 font-extrabold text-primary">#{order.orderId}</td>
                            <td className="px-5 py-4">
                              <p className="font-semibold text-on-surface">{order.customerName}</p>
                              <p className="text-xs text-outline">{order.phone}</p>
                            </td>
                            <td className="px-5 py-4 font-bold text-on-surface">₹{order.total}</td>
                            <td className="px-5 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${pc.color}`}>{pc.label}</span>
                            </td>
                            <td className="px-5 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 w-fit ${order.deliveryType === 'home_delivery' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                                <span className="material-symbols-outlined text-xs">{order.deliveryType === 'home_delivery' ? 'local_shipping' : 'store'}</span>
                                {order.deliveryType === 'home_delivery' ? 'Home' : 'Takeaway'}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : order.status === 'ready' ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700'}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-outline text-xs">
                              {new Date(order.createdAt).toLocaleDateString('en-IN')}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-slate-50">
                  {orders.map(order => {
                    const pc = paymentConfig[order.paymentMethod]
                    return (
                      <div key={order._id} className="p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-primary">#{order.orderId}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${pc.color}`}>{pc.label}</span>
                        </div>
                        <p className="font-semibold text-sm text-on-surface">{order.customerName}</p>
                        <div className="flex justify-between">
                          <span className="text-outline text-xs">{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                          <span className="font-bold text-on-surface">₹{order.total}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default Collection