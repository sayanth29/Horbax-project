import { useEffect, useState, useCallback } from 'react'
import api from '../api/axios'
import type { Expense } from '../types/types'

interface ExpenseData {
  total:      number
  shopTotal:  number
  ownerTotal: number
  byCategory: Record<string, number>
  expenses:   Expense[]
}

type TabType = 'today' | 'month' | 'range'

const shopCategories = [
  'Washing Liquid', 'Cleaning Supplies',
  'Equipment', 'Electricity', 'Rent',
  'Transport', 'Other'
]

const ownerCategories = [
  'Salary', 'Food', 'Travel',
  'Personal', 'Medical', 'Other'
]

const Expenses = () => {
  const [activeTab, setActiveTab]       = useState<TabType>('today')
  const [data, setData]                 = useState<ExpenseData | null>(null)
  const [loading, setLoading]           = useState(true)
  const [fromDate, setFromDate]         = useState('')
  const [toDate, setToDate]             = useState('')
  const [itemName, setItemName]         = useState('')
  const [amount, setAmount]             = useState('')
  const [category, setCategory]         = useState('')
  const [expenseType, setExpenseType]   = useState<'shop' | 'owner'>('shop')
  const [notes, setNotes]               = useState('')
  const [formError, setFormError]       = useState('')
  const [formSuccess, setFormSuccess]   = useState('')
  const [submitting, setSubmitting]     = useState(false)

  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    try {
      let url = `/expenses/${activeTab}`
      if (activeTab === 'range' && fromDate && toDate) {
        url = `/expenses/range?from=${fromDate}&to=${toDate}`
      }
      const { data } = await api.get<ExpenseData>(url)
      setData(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [activeTab, fromDate, toDate])

  useEffect(() => {
    if (activeTab === 'range' && (!fromDate || !toDate)) return
    fetchExpenses()
  }, [activeTab, fromDate, toDate, fetchExpenses])

  const handleSubmit = async () => {
    setFormError('')
    setFormSuccess('')
    if (!itemName || !amount || !category) {
      setFormError('Please fill all required fields')
      return
    }
    try {
      setSubmitting(true)
      await api.post('/expenses', {
        itemName,
        amount: parseFloat(amount),
        category,
        expenseType,
        notes,
      })
      setFormSuccess('Expense added successfully!')
      setItemName('')
      setAmount('')
      setCategory('')
      setNotes('')
      fetchExpenses()
    } catch (_err) {
      setFormError('Failed to add expense')
    } finally {
      setSubmitting(false)
    }
  }

  
  const categories = expenseType === 'shop' ? shopCategories : ownerCategories
  const rupee = '\u20B9'

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">

      <div className="mb-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-on-surface">
          Extra Expenses
        </h2>
        <p className="text-outline text-base font-medium mt-1">
          Track shop and owner expenses
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">

        {/* LEFT — Add Expense Form */}
        <div className="col-span-12 lg:col-span-4">
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-on-surface text-lg">Add Expense</h3>

            {/* Expense Type Toggle */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-outline uppercase tracking-wider">
                Expense Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setExpenseType('shop'); setCategory('') }}
                  className={`py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all border ${
                    expenseType === 'shop'
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-outline border-slate-200 hover:border-primary/40'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">store</span>
                  Shop
                </button>
                <button
                  onClick={() => { setExpenseType('owner'); setCategory('') }}
                  className={`py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all border ${
                    expenseType === 'owner'
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-outline border-slate-200 hover:border-purple-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">person</span>
                  Owner
                </button>
              </div>
            </div>

            {/* Item Name */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-outline uppercase tracking-wider">
                Item Name *
              </label>
              <input
                type="text"
                value={itemName}
                onChange={e => setItemName(e.target.value)}
                placeholder="e.g. Surf Excel 5kg"
                className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/40 text-sm font-medium outline-none transition-all"
              />
            </div>

            {/* Amount */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-outline uppercase tracking-wider">
                Amount *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline font-bold text-sm">
                  {rupee}
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/40 text-sm font-bold outline-none transition-all"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-outline uppercase tracking-wider">
                Category *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/40 text-sm font-medium outline-none transition-all appearance-none"
              >
                <option value="">Select category</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-outline uppercase tracking-wider">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Optional notes..."
                rows={2}
                className="w-full p-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/40 text-sm font-medium resize-none outline-none transition-all"
              />
            </div>

            {formError && <p className="text-red-500 text-xs font-medium">{formError}</p>}
            {formSuccess && <p className="text-emerald-600 text-xs font-medium">{formSuccess}</p>}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">add</span>
                  Add Expense
                </>
              )}
            </button>
          </section>
        </div>

        {/* RIGHT — Expense List */}
        <div className="col-span-12 lg:col-span-8 space-y-5">

          {/* Tabs */}
          <div className="flex gap-2 flex-wrap items-center">
            {[
              { key: 'today', label: 'Today',      icon: 'today'          },
              { key: 'month', label: 'This Month', icon: 'calendar_month' },
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

          {/* Date Range Picker */}
          {activeTab === 'range' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4 flex-wrap">
              <span className="material-symbols-outlined text-primary">date_range</span>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-outline uppercase tracking-wider">From</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                  max={toDate || new Date().toISOString().split('T')[0]}
                  className="px-3 py-2 rounded-lg border border-slate-200 bg-surface-container-low text-sm font-bold outline-none focus:border-primary/40"
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
                  className="px-3 py-2 rounded-lg border border-slate-200 bg-surface-container-low text-sm font-bold outline-none focus:border-primary/40"
                />
              </div>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <p className="text-[11px] font-bold text-outline uppercase tracking-wider mb-1">Total</p>
              <p className="text-2xl font-extrabold text-on-surface">{rupee}{data?.total ?? 0}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <p className="text-[11px] font-bold text-outline uppercase tracking-wider mb-1">Shop</p>
              <p className="text-2xl font-extrabold text-primary">{rupee}{data?.shopTotal ?? 0}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <p className="text-[11px] font-bold text-outline uppercase tracking-wider mb-1">Owner</p>
              <p className="text-2xl font-extrabold text-purple-600">{rupee}{data?.ownerTotal ?? 0}</p>
            </div>
          </div>

          {/* Expense List */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-on-surface">Expense List</h3>
              <span className="text-xs text-outline font-medium">{data?.expenses.length ?? 0} items</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : !data?.expenses.length ? (
              <div className="p-12 text-center">
                <span className="material-symbols-outlined text-5xl text-outline/40">receipt_long</span>
                <p className="text-outline mt-3 font-medium">No expenses for this period</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {data.expenses.map(expense => (
                  <div key={expense._id} className="px-5 py-4 flex items-center justify-between hover:bg-surface-container-low transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        expense.expenseType === 'shop' ? 'bg-sky-50 text-primary' : 'bg-purple-50 text-purple-600'
                      }`}>
                        <span className="material-symbols-outlined text-lg">
                          {expense.expenseType === 'shop' ? 'store' : 'person'}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-on-surface text-sm">{expense.itemName}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            expense.expenseType === 'shop'
                              ? 'bg-sky-100 text-sky-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {expense.expenseType === 'shop' ? 'Shop' : 'Owner'}
                          </span>
                          <span className="text-xs text-outline">{expense.category}</span>
                          <span className="text-xs text-outline">
                            {new Date(expense.createdAt).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                        {expense.notes && (
                          <p className="text-xs text-outline mt-0.5">{expense.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-on-surface">{rupee}{expense.amount}</span>
                      
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Expenses