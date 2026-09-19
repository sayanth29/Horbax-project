'use client'

import React from 'react'
import { useEffect, useState } from 'react'
import api from '../api/axios'
import type { Order } from '../types/types'
import PrintBill from '../components/PrintBill'
import EditDeliveryModal from '../components/EditDeliveryModal'

const statusConfig: Record<string, { color: string; dot: string; label: string }> = {
  pending:   { color: 'bg-amber-100 text-amber-700',     dot: 'bg-amber-400 animate-pulse', label: 'Pending'   },
  ready:     { color: 'bg-sky-100 text-sky-700',         dot: 'bg-sky-400',                 label: 'Ready'     },
  completed: { color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500',             label: 'Completed' },
}

const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

const Pending = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [printOrder, setPrintOrder] = useState<Order | null>(null)
  const [activeTab, setActiveTab] = useState<'pending' | 'ready'>('pending')
  const [editDeliveryOrder, setEditDeliveryOrder] = useState<Order | null>(null)
  const [search, setSearch] = useState('')

  const fetchOrders = async () => {
    try {
      const { data } = await api.get<Order[]>('/orders/pending')
      setOrders(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  // Mark order as ready
  const markReady = async (id: string) => {
    try {
      await api.patch(`/orders/${id}/ready`)
      fetchOrders()
    } catch (err) {
      console.error(err)
    }
  }

  // Mark as collected — show payment modal
  const [collectOrder, setCollectOrder] = useState<Order | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('cash_paid')
  const [upiAmount, setUpiAmount] = useState(0)
  const [cashAmount, setCashAmount] = useState(0)

  // Automatically initialize amounts when modal opens or payment method changes
  useEffect(() => {
    if (collectOrder) {
      if (paymentMethod === 'cash_paid') {
        setCashAmount(collectOrder.total)
        setUpiAmount(0)
      } else if (paymentMethod === 'upi') {
        setUpiAmount(collectOrder.total)
        setCashAmount(0)
      } else if (paymentMethod === 'upi_cash') {
        setUpiAmount(0)
        setCashAmount(0)
      }
    }
  }, [paymentMethod, collectOrder])

  const confirmCollect = async () => {
    if (!collectOrder) return
    try {
      await api.patch(`/orders/${collectOrder._id}/collect`, {
        paymentMethod,
        total: collectOrder.total,
        upiAmount,
        cashAmount,
      })
      setCollectOrder(null)
      fetchOrders()
    } catch (err) {
      console.error(err)
    }
  }

  // Client-side search filter
  const filterBySearch = (ordersList: Order[]) => {
    if (!search.trim()) return ordersList
    const q = search.trim().toLowerCase()
    return ordersList.filter(o =>
      o.customerName.toLowerCase().includes(q) ||
      o.phone.toLowerCase().includes(q) ||
      o.orderId.toLowerCase().includes(q)
    )
  }

  const pendingOrders = orders.filter(o => o.status === 'pending')
  const readyOrders   = orders.filter(o => o.status === 'ready')
  const displayed     = filterBySearch(activeTab === 'pending' ? pendingOrders : readyOrders)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-on-surface">
          Pending Orders
        </h2>
        <p className="text-outline text-base font-medium mt-1">
          Manage and track active orders
        </p>
      </div>

      {/* Search + Tabs Row */}
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
            className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 text-sm font-medium outline-none transition-all shadow-sm"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'pending'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-white text-outline border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined text-lg">hourglass_empty</span>
            Pending
            <span className="bg-amber-200 text-amber-800 text-xs px-2 py-0.5 rounded-full font-extrabold">
              {pendingOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ready')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'ready'
                ? 'bg-sky-100 text-sky-700'
                : 'bg-white text-outline border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined text-lg">check_circle</span>
            Ready
            <span className="bg-sky-200 text-sky-800 text-xs px-2 py-0.5 rounded-full font-extrabold">
              {readyOrders.length}
            </span>
          </button>
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-outline mb-4 font-medium">
        Showing {displayed.length} {activeTab} order{displayed.length !== 1 ? 's' : ''}
      </p>

      {/* Orders */}
      {displayed.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-outline/40">
            {search ? 'search_off' : activeTab === 'pending' ? 'hourglass_empty' : 'check_circle'}
          </span>
          <p className="text-outline mt-3 font-medium">
            {search ? `No ${activeTab} orders matching "${search}"` : `No ${activeTab} orders right now`}
          </p>
        </div>
      ) : (
        <>
          {/* ===== Desktop Table ===== */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Order ID', 'Customer', 'Items', 'Amount', 'Delivery', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-outline">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {displayed.map(order => {
                  const sc = statusConfig[order.status]
                  return (
                    <tr key={order._id} className="hover:bg-surface-container-low transition-colors">
                      {/* Order ID */}
                      <td className="px-5 py-4">
                        <span className="font-extrabold text-primary">
                          #{order.orderId}
                        </span>
                      </td>

                      {/* Customer */}
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

                      {/* Items */}
                      <td className="px-5 py-4 text-outline text-xs max-w-[200px]">
                        {order.items.map(i => `${i.qty}× ${i.cloth} (${i.wash})`).join(', ')}
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4 font-bold text-on-surface">
                        ₹{order.total}
                      </td>

                      {/* Delivery */}
                      <td className="px-5 py-4">
                        <div className="space-y-1">
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
                          {order.deliveryDate && (
                            <p className="text-[10px] text-outline flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-xs">event</span>
                              {order.deliveryDate}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 w-fit ${sc.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-outline text-xs">
                        <div>{new Date(order.createdAt).toLocaleDateString('en-IN')}</div>
                        <div className="text-[10px] text-outline/60 mt-0.5">
                          {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex gap-1.5 flex-wrap">
                          {/* Print Bill */}
                          <button
                            onClick={() => setPrintOrder(order)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors text-xs font-bold"
                          >
                            <span className="material-symbols-outlined text-sm">print</span>
                            Bill
                          </button>

                          {/* Edit Delivery */}
                          <button
                            onClick={() => setEditDeliveryOrder(order)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors text-xs font-bold"
                          >
                            <span className="material-symbols-outlined text-sm">local_shipping</span>
                          </button>

                          {/* Mark Ready — only for pending */}
                          {order.status === 'pending' && (
                            <button
                              onClick={() => markReady(order._id)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-100 text-sky-700 hover:bg-sky-200 transition-colors text-xs font-bold"
                            >
                              <span className="material-symbols-outlined text-sm">check_circle</span>
                              Ready
                            </button>
                          )}

                          {/* Mark Collected — only for ready */}
                          {order.status === 'ready' && (
                            <button
                              onClick={() => {
                                setPaymentMethod('cash_paid')
                                setCollectOrder(order)
                              }}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors text-xs font-bold"
                            >
                              <span className="material-symbols-outlined text-sm">done_all</span>
                              Collected
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* ===== Mobile Cards ===== */}
          <div className="md:hidden space-y-3">
            {displayed.map(order => {
              const sc = statusConfig[order.status]
              return (
                <div key={order._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-shadow">
                  {/* Top: Order ID + Status */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-extrabold text-primary">
                      #{order.orderId}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 ${sc.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {sc.label}
                    </span>
                  </div>

                  {/* Customer */}
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

                  {/* Items */}
                  <p className="text-xs text-outline mb-2">
                    {order.items.map(i => `${i.qty}× ${i.cloth} (${i.wash})`).join(' • ')}
                  </p>

                  {/* Amount + Delivery info */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-extrabold text-on-surface text-lg">₹{order.total}</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 ${
                        order.deliveryType === 'home_delivery'
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        <span className="material-symbols-outlined text-xs">
                          {order.deliveryType === 'home_delivery' ? 'local_shipping' : 'store'}
                        </span>
                        {order.deliveryType === 'home_delivery' ? 'Home' : 'Takeaway'}
                      </span>
                      {order.deliveryDate && (
                        <span className="text-[10px] text-outline flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-xs">event</span>
                          {order.deliveryDate}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap border-t border-slate-100 pt-3">
                    <button
                      onClick={() => setPrintOrder(order)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors text-xs font-bold"
                    >
                      <span className="material-symbols-outlined text-sm">print</span>
                      Bill
                    </button>

                    <button
                      onClick={() => setEditDeliveryOrder(order)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors text-xs font-bold"
                    >
                      <span className="material-symbols-outlined text-sm">local_shipping</span>
                      Delivery
                    </button>

                    {order.status === 'pending' && (
                      <button
                        onClick={() => markReady(order._id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-100 text-sky-700 hover:bg-sky-200 transition-colors text-xs font-bold"
                      >
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Mark Ready
                      </button>
                    )}

                    {order.status === 'ready' && (
                      <button
                        onClick={() => {
                          setPaymentMethod('cash_paid')
                          setCollectOrder(order)
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors text-xs font-bold"
                      >
                        <span className="material-symbols-outlined text-sm">done_all</span>
                        Collected
                      </button>
                    )}
                  </div>

                  {/* Date */}
                  <p className="text-[11px] text-outline mt-2">
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    <span className="text-outline/60 ml-1.5">
                      {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </span>
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

      {/* Collect Modal */}
      {collectOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-extrabold text-on-surface text-lg mb-1">
              Mark as Collected
            </h3>
            <p className="text-outline text-sm mb-5">
              Order #{collectOrder.orderId} — ₹{collectOrder.total}
            </p>

            {/* Payment Method */}
            <div className="space-y-2 mb-4">
              <label className="text-[11px] font-bold text-outline uppercase tracking-wider">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={e => {
                  setPaymentMethod(e.target.value)
                  setUpiAmount(0)
                  setCashAmount(0)
                }}
                className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/40 text-sm font-medium outline-none"
              >
                <option value="cash_paid">Cash Paid</option>
                <option value="upi">UPI</option>
                <option value="upi_cash">UPI + Cash</option>
              </select>
            </div>

            {/* Custom Payment Amount Inputs */}
            {paymentMethod === 'upi_cash' ? (
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-outline uppercase tracking-wider">
                    UPI Amount
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={isNaN(upiAmount) || upiAmount === 0 ? '' : upiAmount}
                    onChange={e => setUpiAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2.5 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/40 text-sm font-medium outline-none"
                    placeholder="₹0"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-outline uppercase tracking-wider">
                    Cash Amount
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={isNaN(cashAmount) || cashAmount === 0 ? '' : cashAmount}
                    onChange={e => setCashAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2.5 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/40 text-sm font-medium outline-none"
                    placeholder="₹0"
                  />
                </div>
              </div>
            ) : paymentMethod === 'cash_paid' ? (
              <div className="space-y-1 mb-4">
                <label className="text-[11px] font-bold text-outline uppercase tracking-wider">
                  Cash Amount Paid
                </label>
                <input
                  type="number"
                  min={0}
                  max={collectOrder.total}
                  value={isNaN(cashAmount) || cashAmount === 0 ? '' : cashAmount}
                  onChange={e => setCashAmount(Math.max(0, Math.min(collectOrder.total, parseFloat(e.target.value) || 0)))}
                  className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/40 text-sm font-medium outline-none"
                  placeholder="₹0"
                />
              </div>
            ) : (
              <div className="space-y-1 mb-4">
                <label className="text-[11px] font-bold text-outline uppercase tracking-wider">
                  UPI Amount Paid
                </label>
                <input
                  type="number"
                  min={0}
                  max={collectOrder.total}
                  value={isNaN(upiAmount) || upiAmount === 0 ? '' : upiAmount}
                  onChange={e => setUpiAmount(Math.max(0, Math.min(collectOrder.total, parseFloat(e.target.value) || 0)))}
                  className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/40 text-sm font-medium outline-none"
                  placeholder="₹0"
                />
              </div>
            )}

            {/* Show remaining balance/credit info */}
            {collectOrder && (
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 mb-4 space-y-1 text-xs font-semibold text-slate-600">
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span>₹{collectOrder.total}</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>Total Paid:</span>
                  <span>₹{(upiAmount || 0) + (cashAmount || 0)}</span>
                </div>
                <div className="h-px bg-slate-200 my-1" />
                <div className="flex justify-between">
                  <span>Remaining Due (Credit):</span>
                  <span className={(collectOrder.total - (upiAmount || 0) - (cashAmount || 0)) > 0 ? 'text-red-500 font-bold text-sm' : 'text-slate-500 font-bold'}>
                    ₹{Math.max(0, collectOrder.total - (upiAmount || 0) - (cashAmount || 0))}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={confirmCollect}
                className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors"
              >
                Confirm ✓
              </button>
              <button
                onClick={() => setCollectOrder(null)}
                className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Delivery Modal */}
      {editDeliveryOrder && (
        <EditDeliveryModal
          order={editDeliveryOrder}
          onClose={() => setEditDeliveryOrder(null)}
          onSuccess={fetchOrders}
        />
      )}
    </div>
  )
}

export default Pending
