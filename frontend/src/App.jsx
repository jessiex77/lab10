import { useAuthContext } from '@asgardeo/auth-react'
import Header from './components/Header'
import Body from './components/Body'
import Footer from './components/Footer'
import './App.css'

function App() {
  const { state, signIn, signOut } = useAuthContext()

  if (!state.isAuthenticated) {
    return (
      <div className="app-wrapper">
        <div className="login-screen">
          <h1>🐶 Puppy Manager</h1>
          <p>Please sign in to manage your puppies</p>
          <button className="btn-add" onClick={() => signIn()}>Sign In</button>
        </div>
      </div>
    )
  }

  return (
    <div className="app-wrapper">
      <Header signOut={signOut} username={state.username} />
      <Body />
      <Footer />
    </div>
  )
}

export default App