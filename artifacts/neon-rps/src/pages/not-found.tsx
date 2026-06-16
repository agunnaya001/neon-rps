import { Link } from 'wouter'
import { Home, AlertTriangle } from 'lucide-react'
import Layout from '@/components/Layout'

export default function NotFound() {
  return (
    <Layout>
      <section className="max-w-lg mx-auto px-4 py-32 text-center fade-in">
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8"
          style={{ backgroundColor: 'rgba(255,0,110,0.1)', border: '1px solid rgba(255,0,110,0.3)' }}>
          <AlertTriangle size={48} style={{ color: '#ff006e' }} />
        </div>
        <div className="text-7xl font-black mb-4 gradient-text">404</div>
        <h1 className="text-2xl font-bold text-white mb-3">Page Not Found</h1>
        <p className="mb-10 leading-relaxed" style={{ color: '#666' }}>
          This page doesn't exist or was moved. Head back to the arena.
        </p>
        <Link href="/">
          <span className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-[#0f0f23] shimmer-btn cursor-pointer transition-all hover:-translate-y-0.5">
            <Home size={18} />
            Back to Home
          </span>
        </Link>
      </section>
    </Layout>
  )
}
