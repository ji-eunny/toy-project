import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Header = () => {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="bg-gradient-to-r from-primary via-primary to-secondary text-dark py-4 shadow-md sticky top-0 z-50 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-5">
            <div className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:opacity-70 transition" onClick={() => navigate('/')}>
              <span className="text-3xl sm:text-5xl">🐾</span>
              <h1 className="text-lg sm:text-xl font-bold hidden sm:block">PETMILY</h1>
            </div>
            <nav className="flex gap-3 sm:gap-6 text-xs sm:text-base">
              <a href="/" className="text-dark font-semibold hover:opacity-70 transition">
                HOME
              </a>
              {user && (
                <Link to="/mypage" className="text-dark font-semibold hover:opacity-70 transition whitespace-nowrap">
                  MY PAGE
                </Link>
              )}
            </nav>
          </div>

          {user && (
            <div className="flex items-center gap-2 sm:gap-4 whitespace-nowrap">
              <span className="text-xs sm:text-sm font-semibold hidden xs:inline">Hi, {displayName}</span>
              <button
                onClick={handleLogout}
                className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg font-semibold transition cursor-pointer"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
