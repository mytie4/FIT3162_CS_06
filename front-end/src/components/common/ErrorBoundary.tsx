import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Surface the failure in the console so devs/users can report it.
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            background: '#f5f6fa',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: 480,
              width: '100%',
              padding: 32,
              borderRadius: 12,
              background: '#ffffff',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
              textAlign: 'center',
            }}
          >
            <h1 style={{ margin: '0 0 12px', fontSize: 22, color: '#1f2937' }}>
              Something went wrong
            </h1>
            <p style={{ margin: '0 0 24px', color: '#4b5563', lineHeight: 1.5 }}>
              An unexpected error occurred while rendering this page. Try
              reloading; if the problem persists, please contact support.
            </p>
            {this.state.error?.message ? (
              <pre
                style={{
                  textAlign: 'left',
                  background: '#f3f4f6',
                  padding: 12,
                  borderRadius: 8,
                  fontSize: 12,
                  color: '#374151',
                  margin: '0 0 24px',
                  overflowX: 'auto',
                }}
              >
                {this.state.error.message}
              </pre>
            ) : null}
            <button
              type="button"
              onClick={this.handleReload}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                border: 'none',
                background: '#2563eb',
                color: '#ffffff',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
