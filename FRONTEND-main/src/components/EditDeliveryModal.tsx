'use client'

import { useState } from 'react'
import api from '../api/axios'
import type { Order } from '../types/types'

interface EditDeliveryModalProps {
  order: Order
  onClose: () => void
  onSuccess: () => void
}

const EditDeliveryModal = ({ order, onClose, onSuccess }: EditDeliveryModalProps) => {
  const [deliveryType, setDeliveryType] = useState<'takeaway' | 'home_delivery'>(order.deliveryType || 'takeaway')
  const [deliveryAddress, setDeliveryAddress] = useState(order.deliveryAddress || '')
  const [deliveryCharge, setDeliveryCharge] = useState(order.deliveryCharge || 0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    setError('')
    setLoading(true)

    // Calculate updated total
    const oldCharge = order.deliveryCharge || 0
    const newCharge = deliveryType === 'home_delivery' ? deliveryCharge : 0
    const newTotal = order.total - oldCharge + newCharge

    try {
      await api.patch(`/orders/${order._id}`, {
        deliveryType,
        deliveryAddress: deliveryType === 'home_delivery' ? deliveryAddress : '',
        deliveryCharge: newCharge,
        total: newTotal,
      })
      onSuccess()
      onClose()
    } catch (err) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to update delivery details'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div>
          <h3 className="font-extrabold text-on-surface text-lg mb-1">Edit Delivery Logistics</h3>
          <p className="text-outline text-xs">Order #{order.orderId} • Current Total: ₹{order.total}</p>
        </div>

        {/* Delivery Type */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-outline uppercase tracking-wider">Delivery Type</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setDeliveryType('takeaway')
              }}
              className={`py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all border ${
                deliveryType === 'takeaway'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-outline border-slate-200 hover:border-primary/40'
              }`}
            >
              <span className="material-symbols-outlined text-lg">store</span>
              Takeaway
            </button>
            <button
              onClick={() => setDeliveryType('home_delivery')}
              className={`py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all border ${
                deliveryType === 'home_delivery'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-outline border-slate-200 hover:border-primary/40'
              }`}
            >
              <span className="material-symbols-outlined text-lg">local_shipping</span>
              Home Delivery
            </button>
          </div>
        </div>

        {/* Home Delivery Fields */}
        {deliveryType === 'home_delivery' && (
          <>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-outline uppercase tracking-wider">Delivery Address</label>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter address..."
                rows={2}
                className="w-full p-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/40 text-sm font-medium resize-none outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-outline uppercase tracking-wider">Delivery Charge</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline font-bold text-sm">₹</span>
                <input
                  type="number"
                  value={isNaN(deliveryCharge) || deliveryCharge === 0 ? '' : deliveryCharge}
                  onChange={(e) => setDeliveryCharge(parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2.5 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/40 text-sm font-bold outline-none transition-all"
                />
              </div>
            </div>
          </>
        )}

        {/* Estimated New Total */}
        <div className="bg-slate-50 p-3 rounded-xl flex justify-between items-center text-xs font-semibold">
          <span className="text-outline">Estimated New Total:</span>
          <span className="text-primary font-bold text-sm">
            ₹{order.total - (order.deliveryCharge ) + (deliveryType === 'home_delivery' ? deliveryCharge : 0)}
          </span>
        </div>

        {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 disabled:opacity-75"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              'Save Details'
            )}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditDeliveryModal
