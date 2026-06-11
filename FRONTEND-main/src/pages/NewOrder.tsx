import { useState, useEffect } from 'react'
import api from '../api/axios'
import type { Settings } from '../types/types'

interface ClothRow {
  id: number
  cloth: string
  qty: number
  wash: string
  basePrice: number
}

const NewOrder = () => {

  // ===== STATE =====
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [notes, setNotes] = useState('')
  const [deliveryType, setDeliveryType] = useState<'takeaway' | 'home_delivery'>('takeaway')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryCharge, setDeliveryCharge] = useState(0)
  const [rows, setRows] = useState<ClothRow[]>([
    { id: 1, cloth: '', qty: 1, wash: '', basePrice: 0 }
  ])
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  // ===== EFFECTS =====
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get<Settings>('/settings')
        setSettings(data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchSettings()
  }, [])

  // ===== HELPERS =====
  const getWashPrice = (washName: string) =>
    settings?.washTypes.find(w => w.name === washName)?.price ?? 0

  const getRowTotal = (row: ClothRow) =>
    (getWashPrice(row.wash) * row.qty) + (row.basePrice * row.qty)

  // ===== FUNCTIONS =====
  const handlePhoneChange = async (value: string) => {
    setPhone(value)
    if (value.length >= 10) {
      try {
        const { data } = await api.get(`/customers/phone/${value}`)
        if (data?.name) setName(data.name)
      } catch {
        // New customer
      }
    }
  }

  const addRow = () => {
    setRows(prev => [
      ...prev,
      { id: Date.now(), cloth: '', qty: 1, wash: '', basePrice: 0 },
    ])
  }

  const removeRow = (id: number) => {
    if (rows.length === 1) return
    setRows(prev => prev.filter(r => r.id !== id))
  }

  const updateRow = (id: number, field: keyof ClothRow, value: string | number) => {
    setRows(prev => prev.map(row => {
      if (row.id !== id) return row
      const updated = { ...row, [field]: value }
      if (field === 'cloth') {
        const clothType = settings?.clothTypes.find(
          c => c.name.toLowerCase() === (value as string).toLowerCase()
        )
        updated.basePrice = clothType ? clothType.price : 0
      }
      return updated
    }))
  }

  const updateQty = (id: number, delta: number) => {
    setRows(prev => prev.map(row => {
      if (row.id !== id) return row
      return { ...row, qty: Math.max(1, row.qty + delta) }
    }))
  }

  const clearForm = () => {
    setPhone('')
    setName('')
    setDeliveryDate('')
    setNotes('')
    setDeliveryType('takeaway')
    setDeliveryAddress('')
    setDeliveryCharge(0)
    setRows([{ id: 1, cloth: '', qty: 1, wash: '', basePrice: 0 }])
    setError('')
    setSuccess('')
  }

  // Grand total = all row totals + delivery charge
  const total = rows.reduce((sum, row) => sum + getRowTotal(row), 0) + deliveryCharge

  const placeOrder = async () => {
    setError('')
    setSuccess('')

    if (!phone || !name) {
      setError('Please enter customer phone and name')
      return
    }

    const validRows = rows.filter(r => r.cloth && r.wash)
    if (validRows.length === 0) {
      setError('Please add at least one cloth item with wash type')
      return
    }

    try {
      setLoading(true)
      await api.post('/orders', {
        customerName: name,
        phone,
        items: validRows.map(r => ({ qty: r.qty, cloth: r.cloth, wash: r.wash, price: getRowTotal(r) })),
        total,
        deliveryDate,
        deliveryType,
        deliveryAddress,
        deliveryCharge,
        notes,
      })
      setSuccess('Order placed successfully! 🎉')
      clearForm()
    } catch (err) {
      setError(
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message || 'Failed to place order'
      )
    } finally {
      setLoading(false)
    }
  }

  // ===== RENDER =====
  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">

      <div className="mb-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-on-surface">
          New Order
        </h2>
        <p className="text-outline text-base font-medium mt-1">
          Register a fresh service request
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6 items-start">

        {/* ===== LEFT COLUMN ===== */}
        <div className="col-span-12 lg:col-span-8 space-y-6">

          {/* Customer Details */}
          <section className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">person_add</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface">Customer Identification</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-outline uppercase tracking-wider">
                  Customer Phone
                </label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-xl">
                    call
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => handlePhoneChange(e.target.value)}
                    placeholder="Phone number"
                    className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low rounded-lg border border-transparent focus:border-primary/40 focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all text-sm font-medium outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-outline uppercase tracking-wider">
                  Customer Name
                </label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-xl">
                    badge
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Full name"
                    className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low rounded-lg border border-transparent focus:border-primary/40 focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all text-sm font-medium outline-none"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Cloth Items */}
          <section className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">checkroom</span>
                </div>
                <h3 className="text-lg font-bold text-on-surface">Cloth Items</h3>
              </div>
              <button
                onClick={addRow}
                className="text-primary text-sm font-bold flex items-center gap-1 hover:opacity-75 transition-opacity"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                Add Item
              </button>
            </div>

            {/* Column Headers */}
            <div className="hidden sm:grid grid-cols-12 px-2 pb-3">
              <div className="col-span-3 text-[10px] font-bold text-outline uppercase tracking-widest">Item</div>
              <div className="col-span-2 text-[10px] font-bold text-outline uppercase tracking-widest">Qty</div>
              <div className="col-span-3 text-[10px] font-bold text-outline uppercase tracking-widest">Wash Type</div>
              <div className="col-span-2 text-[10px] font-bold text-outline uppercase tracking-widest text-center">Additional ₹</div>
              <div className="col-span-1 text-[10px] font-bold text-outline uppercase tracking-widest text-right">Total</div>
              <div className="col-span-1" />
            </div>

            {/* Rows */}
            <div className="space-y-3">
              {rows.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-12 items-center gap-2 px-2 py-3 bg-surface-container-low rounded-xl border border-transparent hover:border-slate-200 transition-all"
                >
                  {/* Cloth */}
                  <div className="col-span-12 sm:col-span-3">
                    <input
                      list={`cloth-list-${row.id}`}
                      value={row.cloth}
                      onChange={e => updateRow(row.id, 'cloth', e.target.value)}
                      placeholder="Type or select..."
                      className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 focus:border-primary/40 text-sm font-medium outline-none transition-all"
                    />
                    <datalist id={`cloth-list-${row.id}`}>
                      {settings?.clothTypes.map(c => (
                        <option key={c.name} value={c.name} />
                      ))}
                    </datalist>
                  </div>

                  {/* Qty */}
                  <div className="col-span-4 sm:col-span-2">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => updateQty(row.id, -1)} className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-200 hover:bg-slate-50 font-bold text-sm">−</button>
                      <span className="font-bold text-sm w-6 text-center">{String(row.qty).padStart(2, '0')}</span>
                      <button onClick={() => updateQty(row.id, 1)} className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-200 hover:bg-slate-50 font-bold text-sm">+</button>
                    </div>
                  </div>

                  {/* Wash Type */}
                  <div className="col-span-5 sm:col-span-3">
                    <select
                      value={row.wash}
                      onChange={e => updateRow(row.id, 'wash', e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 focus:border-primary/40 text-sm font-medium outline-none appearance-none"
                    >
                      <option value="">Select wash</option>
                      {settings?.washTypes.map(w => (
                        <option key={w.name} value={w.name}>{w.name} — ₹{w.price}</option>
                      ))}
                    </select>
                  </div>

                  {/* Base Price */}
                  <div className="col-span-3 sm:col-span-2">
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-outline text-xs font-bold">₹</span>
                      <input
                        type="number"
                        // value={row.basePrice}
                        placeholder='0'
                        onChange={e => updateRow(row.id, 'basePrice', parseFloat(e.target.value) || 0)}
                        className="w-full pl-5 pr-1 py-2 bg-white rounded-lg border border-slate-200 focus:border-primary/40 text-sm font-bold outline-none text-primary text-right"

                      />
                    </div>
                  </div>

                  {/* Row Total */}
                  <div className="col-span-2 sm:col-span-1 text-right">
                    <span className="font-extrabold text-primary text-sm">₹{getRowTotal(row)}</span>
                  </div>

                  {/* Delete */}
                  <div className="col-span-1 flex justify-end">
                    <button onClick={() => removeRow(row.id)} className="w-7 h-7 rounded-full flex items-center justify-center text-outline hover:text-red-500 hover:bg-red-50 transition-all">
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* <p className="text-xs text-outline mt-3 px-2">
              💡 Row total = (Cloth ₹ × Qty) + Wash ₹
            </p> */}
          </section>
        </div>

        {/* ===== RIGHT COLUMN ===== */}
        <div className="col-span-12 lg:col-span-4 space-y-5">

          {/* Logistics */}
          <section className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 space-y-5">
            <h3 className="text-lg font-bold text-on-surface">Logistics</h3>

            {/* Delivery Date */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-outline uppercase tracking-wider">
                Delivery Date
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl">event</span>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={e => setDeliveryDate(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-surface-container-low rounded-lg border border-transparent focus:border-primary/40 text-sm font-bold text-slate-700 outline-none transition-all"
                />
              </div>
            </div>

            {/* Delivery Type */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-outline uppercase tracking-wider">
                Delivery Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setDeliveryType('takeaway')
                    setDeliveryCharge(0)
                    setDeliveryAddress('')
                  }}
                  className={`py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all border ${deliveryType === 'takeaway'
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-outline border-slate-200 hover:border-primary/40'
                    }`}
                >
                  <span className="material-symbols-outlined text-lg">store</span>
                  Takeaway
                </button>
                <button
                  onClick={() => setDeliveryType('home_delivery')}
                  className={`py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all border ${deliveryType === 'home_delivery'
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
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-outline uppercase tracking-wider">
                    Delivery Address
                  </label>
                  <textarea
                    value={deliveryAddress}
                    onChange={e => setDeliveryAddress(e.target.value)}
                    placeholder="Enter delivery address..."
                    rows={2}
                    className="w-full p-3 bg-surface-container-low rounded-lg border border-transparent focus:border-primary/40 text-sm font-medium resize-none outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-outline uppercase tracking-wider">
                    Delivery Charge
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline font-bold text-sm">₹</span>
                    <input
                      type="number"
                      value={deliveryCharge}
                      onChange={e => setDeliveryCharge(parseFloat(e.target.value))}

                      className="w-full pl-8 pr-4 py-3 bg-surface-container-low rounded-lg border border-transparent focus:border-primary/40 text-sm font-bold outline-none transition-all"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-outline uppercase tracking-wider">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Special handling instructions..."
                rows={2}
                className="w-full p-4 bg-surface-container-low rounded-lg border border-transparent focus:border-primary/40 text-sm font-medium resize-none outline-none transition-all"
              />
            </div>
          </section>

          {/* Order Summary */}
          <section className="bg-primary-container rounded-xl p-6 shadow-lg text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10 -translate-y-1/4 translate-x-1/4 pointer-events-none">
              <span className="material-symbols-outlined text-[10rem]">local_laundry_service</span>
            </div>

            <div className="relative z-10">
              <p className="text-sky-100/70 text-[10px] font-bold uppercase tracking-widest mb-4">
                Order Summary
              </p>

              {/* Items */}
              <div className="space-y-3 mb-3 max-h-48 overflow-y-auto">
                {rows.filter(r => r.cloth).length === 0 ? (
                  <p className="text-sky-100/50 text-xs">No items added yet</p>
                ) : (
                  rows.filter(r => r.cloth).map(r => (
                    <div key={r.id}>
                      <div className="flex justify-between text-sm text-sky-50">
                        <span>{r.qty}× {r.cloth}</span>
                        <span className="font-bold">₹{getRowTotal(r)}</span>
                      </div>
                      <p className="text-[10px] text-sky-100/50 pl-3">
                        {r.wash ? `₹${getWashPrice(r.wash)} × ${r.qty} = ₹${getWashPrice(r.wash) * r.qty}` : ''}
                        {r.basePrice > 0 ? ` + Special ₹${r.basePrice} × ${r.qty} = ₹${r.basePrice * r.qty}` : ''}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Delivery Charge row */}
              {deliveryType === 'home_delivery' && deliveryCharge > 0 && (
                <div className="flex justify-between text-sm text-sky-50 border-t border-white/10 pt-2 mb-2">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">local_shipping</span>
                    Delivery Charge
                  </span>
                  <span className="font-bold">₹{deliveryCharge}</span>
                </div>
              )}

              <div className="h-px bg-white/20 mb-4" />

              {/* Total */}
              <div className="flex justify-between items-end mb-6">
                <span className="font-medium text-sky-100 text-sm">Total Amount</span>
                <span className="text-3xl font-extrabold tracking-tight">₹{total}</span>
              </div>

              {error && (
                <div className="bg-red-500/20 text-red-100 text-xs px-3 py-2 rounded-lg mb-3">{error}</div>
              )}
              {success && (
                <div className="bg-green-500/20 text-green-100 text-xs px-3 py-2 rounded-lg mb-3">{success}</div>
              )}

              <div className="space-y-3">
                <button
                  onClick={placeOrder}
                  disabled={loading}
                  className="w-full py-3.5 rounded-full bg-white text-primary font-bold text-sm shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">verified</span>
                      Place Order
                    </>
                  )}
                </button>

                <button
                  onClick={clearForm}
                  className="w-full py-3.5 rounded-full bg-white/20 text-white font-bold text-sm hover:bg-white/30 transition-colors flex items-center justify-center gap-2 active:scale-95"
                >
                  <span className="material-symbols-outlined text-lg">delete_sweep</span>
                  Clear
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default NewOrder