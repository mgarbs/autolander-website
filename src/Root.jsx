import { Suspense, lazy, useEffect } from 'react'
import App from './App.jsx'
import { pageView } from './lib/tracker.js'

const AdminApp = lazy(() => import('./admin/AdminApp.jsx'))
const PayApp = lazy(() => import('./pay/PayApp.jsx'))
const TeamApp = lazy(() => import('./team/TeamApp.jsx'))

function isAdminPath() {
  if (typeof window === 'undefined') return false
  return window.location.pathname.startsWith('/admin')
}

function isPayPath() {
  if (typeof window === 'undefined') return false
  return window.location.pathname.startsWith('/pay')
}

// Exact /team only (the dealer-team landing page), so no other path can ever route here.
function isTeamPath() {
  if (typeof window === 'undefined') return false
  const path = window.location.pathname
  return path === '/team' || path === '/team/'
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

  if (isTeamPath()) {
    return (
      <Suspense fallback={null}>
        <TeamApp />
      </Suspense>
    )
  }

  return <App />
}
