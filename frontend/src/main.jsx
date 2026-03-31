import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from '@asgardeo/auth-react'
import App from './App.jsx'
import './index.css'

const authConfig = {
  clientID: import.meta.env.VITE_CLIENT_ID,
  baseUrl: import.meta.env.VITE_BASE_URL,
  signInRedirectURL: 'http://localhost:5173',
  signOutRedirectURL: 'http://localhost:5173',
  scope: ['openid', 'profile', 'email'],
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider config={authConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
)