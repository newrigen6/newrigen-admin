import React from 'react'
import ReactDOM from 'react-dom/client'
import * as Sentry from '@sentry/react'
import posthog from 'posthog-js'
import AdminApp from './AdminApp'
import './index.css'

posthog.init('phc_uE3P2LtSmtTWwr64q7WpGZfu5M34aN2x8BBZAGiY2tD7', {
  api_host: 'https://eu.i.posthog.com',
  person_profiles: 'identified_only',
})

Sentry.init({
  dsn: 'https://2ce32e93752527cddc7b011101bcab36@o4511423763513344.ingest.de.sentry.io/4511423862407253',
  environment: import.meta.env.MODE,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  tracesSampleRate: 0.2,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1,
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AdminApp />
  </React.StrictMode>
)
