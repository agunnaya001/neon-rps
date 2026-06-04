import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
      console.error("[ErrorBoundary]", error, info.componentStack);
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-background">
        <div className="arcade-box border-destructive max-w-md w-full p-8 space-y-6 text-center">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto drop-shadow-[0_0_10px_rgba(255,0,0,0.6)]" />

          <div>
            <h1 className="text-2xl font-black arcade-text text-destructive mb-2">
              SYSTEM FAILURE
            </h1>
            <p className="font-mono text-sm text-muted-foreground">
              An unexpected error crashed the interface.
            </p>
          </div>

          {this.state.error?.message && (
            <div className="bg-destructive/10 border border-destructive/30 p-3 rounded font-mono text-xs text-destructive/80 text-left break-all">
              {this.state.error.message.slice(0, 200)}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={() => window.location.reload()}
              className="arcade-btn px-6 py-3 flex items-center justify-center gap-2 w-full"
            >
              <RefreshCw className="w-4 h-4" />
              REBOOT SYSTEM
            </button>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = "/"; }}
              className="arcade-btn arcade-btn-secondary px-6 py-3 w-full text-sm"
            >
              RETURN TO LOBBY
            </button>
          </div>
        </div>
      </div>
    );
  }
}
