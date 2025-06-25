import { ProtectedRoute } from "@/components/protected-route"
import { UserProfile } from "@/components/user-profile"
import { FeedAggLogo } from "@/components/feedagg-logo"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Header */}
        <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <FeedAggLogo size="sm" showTagline={false} />
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                News
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                Saved Content
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                Feeds
              </a>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <div className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-white mb-4">Welcome to Your Dashboard</h1>
              <p className="text-gray-400 text-lg">Start aggregating and organizing your favorite content feeds</p>
            </div>

            <div className="flex justify-center">
              <UserProfile />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
