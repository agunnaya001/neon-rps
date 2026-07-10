import { Component, ReactNode } from 'react'
import { ErrorBoundaryProps, ErrorBoundaryState } from '@/types'
import { COLORS } from '@/lib/constants'

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[neon-rps] Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            className="flex items-center justify-center p-8 rounded-2xl border"
            style={{
              backgroundColor: 'rgba(255,0,110,0.05)',
              borderColor: 'rgba(255,0,110,0.3)',
            }}
          >
            <div className="text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${COLORS.accent}20` }}
              >
                <span style={{ color: COLORS.accent, fontSize: '24px' }}>⚠️</span>
              </div>
              <h3 className="font-bold text-white mb-2">Something went wrong</h3>
              <p style={{ color: '#888', marginBottom: '12px' }}>
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="px-4 py-2 rounded-lg font-semibold transition-all hover:-translate-y-0.5"
                style={{
                  backgroundColor: COLORS.accent,
                  color: '#ffffff',
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
