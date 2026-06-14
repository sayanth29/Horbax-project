'use client'

import React from 'react'

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
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  // Clear Due Modal states
  const [dueOrder, setDueOrder] = useState<Order | null>(null)
  const [clearMethod, setClearMethod] = useState<'upi' | 'cash'>('cash')
  const [clearAmount, setClearAmount] = useState(0)

  const [debouncedSearch, setDebouncedSearch] = useState('')

  const toggleExpand = (id: string) =>
    setExpandedId(prev => (prev === id ? null : id))

  // Debounce search query changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(handler)
  }, [search])

  const fetchOrders = async (reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true)
      }
      const currentPage = reset ? 1 : page
      const { data } = await api.get<{ orders: Order[]; total: number }>('/orders', {
        params: {
          page: currentPage,
          limit: 20,
          search: debouncedSearch,
          status: statusFilter
        }
      })
      if (reset) {
        setOrders(data.orders)
      } else {
        setOrders(prev => [...prev, ...data.orders])
      }
      setTotal(data.total)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Triggered when filters/debouncedSearch change
  useEffect(() => {
    setPage(1)
    fetchOrders(true)
  }, [statusFilter, debouncedSearch])

  // Triggered when page increments (for pagination/loading more)
  useEffect(() => {
    if (page > 1) {
      fetchOrders(false)
    }
  }, [page])

  const handleClearDueClick = (order: Order) => {
    setDueOrder(order)
    setClearMethod('cash')
    setClearAmount(order.dueAmount || 0)
  }

  const confirmClearDue = async () => {
    if (!dueOrder) return
    try {
      const currentDue = dueOrder.dueAmount || 0
      const newUpi = clearMethod === 'upi' ? (dueOrder.upiAmount || 0) + clearAmount : (dueOrder.upiAmount || 0)
      const newCash = clearMethod === 'cash' ? (dueOrder.cashAmount || 0) + clearAmount : (dueOrder.cashAmount || 0)
      const remainingDue = Math.max(0, currentDue - clearAmount)
      const newPaymentMethod = (newUpi > 0 && newCash > 0) ? 'upi_cash' : (newUpi > 0 ? 'upi' : 'cash_paid')

      await api.patch(`/orders/${dueOrder._id}`, {
        upiAmount: newUpi,
        cashAmount: newCash,
        dueAmount: remainingDue,
        paymentMethod: newPaymentMethod,
      })

      setDueOrder(null)
      setPage(1)
      fetchOrders(true)
    } catch (err) {
      console.error(err)
    }
  }

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
          {['all', 'pending', 'ready', 'completed', 'due'].map(s => (
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
        Showing {orders.length} of {total} orders
      </p>

      {/* Desktop Table */}
      {orders.length === 0 ? (
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
                {orders.map(order => {
                  const sc = statusConfig[order.status]
                  const pc = paymentConfig[order.paymentMethod]
                  const isExpanded = expandedId === order._id
                  return (
                    <React.Fragment key={order._id}>
                      <tr className="hover:bg-surface-container-low transition-colors">
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
                              <p className="text-[11px] text-outline">
                                {order.phone.startsWith('NO_PHONE_') ? 'N/A' : order.phone}
                              </p>
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
                          <div className="flex flex-col gap-1 items-start">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${pc.color}`}>
                              {pc.label}
                            </span>
                            {order.dueAmount && order.dueAmount > 0 ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-red-100 text-red-700">
                                Due: ₹{order.dueAmount}
                              </span>
                            ) : null}
                          </div>
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
                              {order.dueAmount && order.dueAmount > 0 ? (
                                <>
                                  <div className="w-px h-5 bg-slate-200" />
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                      <span className="material-symbols-outlined text-red-500 text-base">warning</span>
                                      <span className="text-xs font-semibold text-slate-500">Due (Credit):</span>
                                      <span className="text-sm font-bold text-red-600">₹{order.dueAmount}</span>
                                    </div>
                                    <button
                                      onClick={() => handleClearDueClick(order)}
                                      className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors shadow-sm cursor-pointer"
                                    >
                                      Clear Due
                                    </button>
                                  </div>
                                </>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {orders.map(order => {
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
                      <p className="text-xs text-outline">
                        {order.phone.startsWith('NO_PHONE_') ? 'N/A' : order.phone}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-outline mb-2">
                    {order.items.map(i => `${i.qty}× ${i.cloth}`).join(', ')}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-on-surface">₹{order.total}</span>
                    <div className="flex gap-2 items-center flex-wrap justify-end">
                      {order.dueAmount && order.dueAmount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-red-100 text-red-700">
                          Due: ₹{order.dueAmount}
                        </span>
                      )}
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
                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-3">
                      <div className="flex items-center gap-4 flex-wrap">
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
                      {order.dueAmount && order.dueAmount > 0 ? (
                        <div className="flex items-center justify-between bg-red-50 p-2.5 rounded-xl border border-red-100">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-red-500 text-base">warning</span>
                            <span className="text-xs font-semibold text-slate-500">Due:</span>
                            <span className="text-sm font-bold text-red-600">₹{order.dueAmount}</span>
                          </div>
                          <button
                            onClick={() => handleClearDueClick(order)}
                            className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors shadow-sm cursor-pointer"
                          >
                            Clear Due
                          </button>
                        </div>
                      ) : null}
                    </div>
                  )}
                  <p className="text-[11px] text-outline mt-2">
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
              )
            })}
          </div>

          {/* See More Button */}
          {orders.length < total && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setPage(prev => prev + 1)}
                className="px-6 py-3 bg-white border border-slate-200 text-primary font-bold text-sm rounded-xl hover:border-primary/40 active:scale-95 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">expand_more</span>
                See More
              </button>
            </div>
          )}
        </>
      )}

      {/* Print Bill Modal */}
      {printOrder && (
        <PrintBill
          order={printOrder}
          onClose={() => setPrintOrder(null)}
        />
      )}

      {/* Clear Due Modal */}
      {dueOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div>
              <h3 className="font-extrabold text-on-surface text-lg mb-1">
                Clear Outstanding Due
              </h3>
              <p className="text-outline text-xs">
                Order #{dueOrder.orderId} • Total Due: ₹{dueOrder.dueAmount}
              </p>
            </div>

            {/* Clear Payment Method */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-outline uppercase tracking-wider">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setClearMethod('cash')}
                  className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
                    clearMethod === 'cash'
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-outline border-slate-200 hover:border-primary/40'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">payments</span>
                  Cash
                </button>
                <button
                  type="button"
                  onClick={() => setClearMethod('upi')}
                  className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
                    clearMethod === 'upi'
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-outline border-slate-200 hover:border-primary/40'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">account_balance</span>
                  UPI
                </button>
              </div>
            </div>

            {/* Clear Amount Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-outline uppercase tracking-wider">
                Amount Paid
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline font-bold text-sm">₹</span>
                <input
                  type="number"
                  min={0}
                  max={dueOrder.dueAmount}
                  value={clearAmount || ''}
                  onChange={e => setClearAmount(Math.max(0, Math.min(dueOrder.dueAmount || 0, parseFloat(e.target.value) || 0)))}
                  className="w-full pl-7 pr-3 py-2.5 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/40 text-sm font-bold outline-none transition-all"
                  placeholder="₹0"
                />
              </div>
              <p className="text-[10px] text-outline">
                Maximum allowed: ₹{dueOrder.dueAmount}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={confirmClearDue}
                className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors cursor-pointer"
              >
                Confirm ✓
              </button>
              <button
                onClick={() => setDueOrder(null)}
                className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default History
