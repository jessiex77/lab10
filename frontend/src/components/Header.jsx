const Header = ({ signOut, username }) => {
  return (
    <header className="header">
      <h1>🐶 Puppy Manager</h1>
      <div className="header-right">
        <span>Welcome, {username}</span>
        <button className="btn-signout" onClick={() => signOut()}>Sign Out</button>
      </div>
    </header>
  )
}

export default Header