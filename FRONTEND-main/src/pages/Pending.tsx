import { useEffect, useState } from 'react'
import api from '../api/axios'
import type { Order } from '../types/types'
import PrintBill from '../components/PrintBill'

const statusConfig: Record<string, { color: string; dot: string; label: string }> = {
  pending:   { color: 'bg-amber-100 text-amber-700',     dot: 'bg-amber-400 animate-pulse', label: 'Pending'   },
  ready:     { color: 'bg-sky-100 text-sky-700',         dot: 'bg-sky-400',                 label: 'Ready'     },
  completed: { color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500',             label: 'Completed' },
}

const Pending = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [printOrder, setPrintOrder] = useState<Order | null>(null)
  const [activeTab, setActiveTab] = useState<'pending' | 'ready'>('pending')

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

  const pendingOrders = orders.filter(o => o.status === 'pending')
  const readyOrders   = orders.filter(o => o.status === 'ready')
  const displayed     = activeTab === 'pending' ? pendingOrders : readyOrders

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

      {/* Tabs */}
      <div className="flex gap-3 mb-6">
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

      {/* Orders */}
      {displayed.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-outline/40">
            {activeTab === 'pending' ? 'hourglass_empty' : 'check_circle'}
          </span>
          <p className="text-outline mt-3 font-medium">
            No {activeTab} orders right now
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((order) => {
            const sc = statusConfig[order.status]
            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                  {/* Left — Order Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-primary text-lg">
                        checkroom
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-extrabold text-primary">
                          #{order.orderId}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 ${sc.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                      </div>
                      <p className="font-bold text-on-surface text-sm">
                        {order.customerName}
                      </p>
                      <p className="text-outline text-xs mt-0.5">
                        {order.phone}
                      </p>
                      <p className="text-outline text-xs mt-1">
                        {order.items.map(i => `${i.qty}× ${i.cloth} (${i.wash})`).join(' • ')}
                      </p>
                    </div>
                  </div>

                  {/* Right — Amount + Actions */}
                  <div className="flex flex-col sm:items-end gap-2">
                    <p className="font-extrabold text-on-surface text-lg">
                      ₹{order.total}
                    </p>
                    {order.deliveryDate && (
                      <p className="text-xs text-outline flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">event</span>
                        {order.deliveryDate}
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-wrap">

                      {/* Print Bill */}
                      <button
                        onClick={() => setPrintOrder(order)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors text-xs font-bold"
                      >
                        <span className="material-symbols-outlined text-sm">print</span>
                        Bill
                      </button>

                      {/* Mark Ready — only for pending */}
                      {order.status === 'pending' && (
                        <button
                          onClick={() => markReady(order._id)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-100 text-sky-700 hover:bg-sky-200 transition-colors text-xs font-bold"
                        >
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          Mark Ready
                        </button>
                      )}

                      {/* Mark Collected — only for ready */}
                      {order.status === 'ready' && (
                        <button
                          onClick={() => setCollectOrder(order)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors text-xs font-bold"
                        >
                          <span className="material-symbols-outlined text-sm">done_all</span>
                          Collected
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
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

            {/* UPI + Cash split */}
            {paymentMethod === 'upi_cash' && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-outline uppercase tracking-wider">
                    UPI Amount
                  </label>
                  <input
                    type="number"
                    
                    onChange={e => setUpiAmount(parseFloat(e.target.value))}
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
                    
                    onChange={e => setCashAmount(parseFloat(e.target.value))}
                    className="w-full px-3 py-2.5 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/40 text-sm font-medium outline-none"
                    placeholder="₹0"
                  />
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
    </div>
  )
}

export default Pending