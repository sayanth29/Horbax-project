'use client'

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from './AuthContext'

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setToken(localStorage.getItem('token'))
    setUsername(localStorage.getItem('username'))
    setIsLoading(false)
  }, [])

  const login = (newToken: string, newUsername: string) => {
    localStorage.setItem('token', newToken)
    localStorage.setItem('username', newUsername)
    setToken(newToken)
    setUsername(newUsername)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    setToken(null)
    setUsername(null)
  }

  return (
    <AuthContext.Provider value={{
      token,
      username,
      login,
      logout,
      isAuthenticated: !!token,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
