import { Suspense, lazy, useEffect } from 'react'
import App from './App.jsx'
import { pageView } from './lib/tracker.js'

const AdminApp = lazy(() => import('./admin/AdminApp.jsx'))
const PayApp = lazy(() => import('./pay/PayApp.jsx'))

function isAdminPath() {
  if (typeof window === 'undefined') return false
  return window.location.pathname.startsWith('/admin')
}

function isPayPath() {
  if (typeof window === 'undefined') return false
  return window.location.pathname.startsWith('/pay')
}

export default function Root() {
  useEffect(() => {
    pageView()
  }, [])

  if (isAdminPath()) {
    return (
      <Suspense fallback={null}>
        <AdminApp />
      </Suspense>
    )
  }

  if (isPayPath()) {
    return (
      <Suspense fallback={null}>
        <PayApp />
      </Suspense>
    )
  }

  return <App />
}
