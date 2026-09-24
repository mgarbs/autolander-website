import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Root from './Root.jsx'
import { stashCheckoutSessionFromLocation } from './pay/lib/checkout-session.js'

// Must run before Root's pageView() so the Stripe session id never reaches Meta Pixel/CAPI
// (tracker.js sourceUrl, identity.js current_page): on a /pay/<token>?session_id=cs_… return
// it moves into sessionStorage and leaves the address bar. Effects run after render, so this
// beats every tracking call. A no-op on every other URL.
stashCheckoutSessionFromLocation()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
