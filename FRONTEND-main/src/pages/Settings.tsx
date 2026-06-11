import { useEffect, useState, useCallback } from 'react'
import api from '../api/axios'
import type { Settings } from '../types/types'

const SettingsPage = () => {
  const [settings, setSettings]     = useState<Settings | null>(null)
  const [loading, setLoading]       = useState(true)

  // Wash type form
  const [washName, setWashName]     = useState('')
  const [washPrice, setWashPrice]   = useState('')

  // Cloth type form
  const [clothName, setClothName]   = useState('')
  const [clothPrice, setClothPrice] = useState('')

  // Password form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword]   = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwdMsg, setPwdMsg]             = useState('')
  const [pwdError, setPwdError]         = useState('')

  // Username form
  const [newUsername, setNewUsername]     = useState('')
  const [usernamePassword, setUsernamePassword] = useState('')
  const [usernameMsg, setUsernameMsg]    = useState('')
  const [usernameError, setUsernameError] = useState('')

  // Messages
  const [washMsg, setWashMsg]       = useState('')
  const [clothMsg, setClothMsg]     = useState('')

  const fetchSettings = useCallback(async () => {
    try {
      const { data } = await api.get<Settings>('/settings')
      setSettings(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  // Add wash type
  const addWashType = async () => {
    if (!washName || !washPrice) return
    try {
      await api.post('/settings/wash', {
        name: washName,
        price: Number(washPrice)
      })
      
      setWashName('')
      setWashPrice('')
      setWashMsg('Wash type added!')
      setTimeout(() => setWashMsg(''), 2000)
      fetchSettings()
    } catch (err) {
      setWashMsg('Failed to add')
    }
  }

  // Delete wash type
  const deleteWashType = async (index: number) => {
    try {
      await api.delete(`/settings/wash/${index}`)
      fetchSettings()
    } catch (_err) {
      console.error('Delete failed')
    }
  }

  // Add cloth type
  const addClothType = async () => {
    if (!clothName || !clothPrice) return
    try {
      await api.post('/settings/cloth', {
        name: clothName,
        price: parseFloat(clothPrice)
      })
      setClothName('')
      setClothPrice('')
      setClothMsg('Cloth type added!')
      setTimeout(() => setClothMsg(''), 2000)
      fetchSettings()
    } catch (err: any ) {
  console.error(err.response?.data || err.message)
  setClothMsg(err.response?.data?.message || 'Failed to add')
}
  }

  // Delete cloth type
  const deleteClothType = async (index: number) => {
    try {
      await api.delete(`/settings/cloth/${index}`)
      fetchSettings()
    } catch (_err) {
      console.error('Delete failed')
    }
  }

  // Change password
  const changePassword = async () => {
    setPwdMsg('')
    setPwdError('')
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwdError('Please fill all fields')
      return
    }
    if (newPassword !== confirmPassword) {
      setPwdError('Passwords do not match')
      return
    }
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword })
      setPwdMsg('Password updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setPwdError(err.response?.data?.message || 'Failed to update password')
    }
  }

  // Change username
  const changeUsername = async () => {
    setUsernameMsg('')
    setUsernameError('')
    if (!newUsername || !usernamePassword) {
      setUsernameError('Please fill all fields')
      return
    }
    try {
      const { data } = await api.post('/auth/change-username', {
        newUsername,
        password: usernamePassword,
      })
      // Update stored token and username
      localStorage.setItem('token', data.token)
      localStorage.setItem('username', data.username)
      setUsernameMsg('Username updated successfully!')
      setNewUsername('')
      setUsernamePassword('')
    } catch (err: any) {
      setUsernameError(err.response?.data?.message || 'Failed to update username')
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
    <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="mb-2">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-on-surface">
          Settings
        </h2>
        <p className="text-outline text-base font-medium mt-1">
          Manage wash types, cloth types and account
        </p>
      </div>

      {/* ===== WASH TYPES ===== */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">local_laundry_service</span>
          </div>
          <h3 className="text-lg font-bold text-on-surface">Wash Types</h3>
        </div>

        {/* Existing wash types */}
        <div className="space-y-2 mb-5">
          {settings?.washTypes.length === 0 ? (
            <p className="text-outline text-sm">No wash types added yet</p>
          ) : (
            settings?.washTypes.map((w, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-3 bg-surface-container-low rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-lg">
                    water_drop
                  </span>
                  <span className="font-semibold text-on-surface text-sm">{w.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-primary">&#8377;{w.price}</span>
                  <button
                    onClick={() => deleteWashType(i)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-red-500 hover:bg-red-50 transition-all"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add wash type */}
        <div className="flex gap-3 flex-wrap">
          <input
            type="text"
            value={washName}
            onChange={e => setWashName(e.target.value)}
            placeholder="Wash type name"
            className="flex-1 min-w-[140px] px-4 py-2.5 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/40 text-sm font-medium outline-none transition-all"
          />
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm font-bold">
              &#8377;
            </span>
            <input
              type="number"
              value={washPrice}
              onChange={e => setWashPrice(e.target.value)}
              placeholder="Price"
              className="w-28 pl-7 pr-3 py-2.5 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/40 text-sm font-bold outline-none transition-all"
            />
          </div>
          <button
            onClick={addWashType}
            className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Add
          </button>
        </div>
        {washMsg && (
          <p className="text-emerald-600 text-xs font-medium mt-2">{washMsg}</p>
        )}
      </section>

      {/* ===== CLOTH TYPES ===== */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <span className="material-symbols-outlined">checkroom</span>
          </div>
          <h3 className="text-lg font-bold text-on-surface">Cloth Types</h3>
        </div>

        {/* Existing cloth types */}
        <div className="space-y-2 mb-5">
          {settings?.clothTypes.length === 0 ? (
            <p className="text-outline text-sm">No cloth types added yet</p>
          ) : (
            settings?.clothTypes.map((c, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-3 bg-surface-container-low rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-purple-500 text-lg">
                    checkroom
                  </span>
                  <span className="font-semibold text-on-surface text-sm">{c.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-purple-600">&#8377;{c.price}</span>
                  <button
                    onClick={() => deleteClothType(i)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-red-500 hover:bg-red-50 transition-all"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add cloth type */}
        <div className="flex gap-3 flex-wrap">
          <input
            type="text"
            value={clothName}
            onChange={e => setClothName(e.target.value)}
            placeholder="Cloth type name"
            className="flex-1 min-w-[140px] px-4 py-2.5 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/40 text-sm font-medium outline-none transition-all"
          />
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm font-bold">
              &#8377;
            </span>
            <input
              type="number"
              value={clothPrice}
              onChange={e => setClothPrice(e.target.value)}
              placeholder="Price"
              className="w-28 pl-7 pr-3 py-2.5 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/40 text-sm font-bold outline-none transition-all"
            />
          </div>
          <button
            onClick={addClothType}
            className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Add
          </button>
        </div>
        {clothMsg && (
          <p className="text-emerald-600 text-xs font-medium mt-2">{clothMsg}</p>
        )}
      </section>

      {/* ===== CHANGE PASSWORD ===== */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <span className="material-symbols-outlined">lock</span>
          </div>
          <h3 className="text-lg font-bold text-on-surface">Change Password</h3>
        </div>

        <div className="space-y-3 max-w-sm">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-outline uppercase tracking-wider">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/40 text-sm font-medium outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-outline uppercase tracking-wider">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/40 text-sm font-medium outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-outline uppercase tracking-wider">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/40 text-sm font-medium outline-none transition-all"
            />
          </div>

          {pwdError && (
            <p className="text-red-500 text-xs font-medium">{pwdError}</p>
          )}
          {pwdMsg && (
            <p className="text-emerald-600 text-xs font-medium">{pwdMsg}</p>
          )}

          <button
            onClick={changePassword}
            className="w-full py-3 bg-amber-500 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">lock_reset</span>
            Update Password
          </button>
        </div>
      </section>

      {/* ===== CHANGE USERNAME ===== */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <span className="material-symbols-outlined">person</span>
          </div>
          <h3 className="text-lg font-bold text-on-surface">Change Username</h3>
        </div>

        <div className="space-y-3 max-w-sm">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-outline uppercase tracking-wider">
              New Username
            </label>
            <input
              type="text"
              value={newUsername}
              onChange={e => setNewUsername(e.target.value)}
              placeholder="Enter new username"
              className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/40 text-sm font-medium outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-outline uppercase tracking-wider">
              Password (to confirm)
            </label>
            <input
              type="password"
              value={usernamePassword}
              onChange={e => setUsernamePassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 bg-surface-container-low rounded-xl border border-transparent focus:border-primary/40 text-sm font-medium outline-none transition-all"
            />
          </div>

          {usernameError && (
            <p className="text-red-500 text-xs font-medium">{usernameError}</p>
          )}
          {usernameMsg && (
            <p className="text-emerald-600 text-xs font-medium">{usernameMsg}</p>
          )}

          <button
            onClick={changeUsername}
            className="w-full py-3 bg-indigo-500 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">badge</span>
            Update Username
          </button>
        </div>
      </section>
    </div>
  )
}

export default SettingsPage