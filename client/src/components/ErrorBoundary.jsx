import React from 'react';
import NeoCard from './UI/NeoCard';
import NeoButton from './UI/NeoButton';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--bg-color)', padding: '2rem' }}>
          <NeoCard style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
            <h2 style={{ color: 'var(--clay-pink)', marginBottom: '1rem' }}>Oops! Something went wrong.</h2>
            <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>
              The application encountered an unexpected error. Please try refreshing the page or navigating back home.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <NeoButton variant="primary" onClick={() => window.location.reload()}>
                Refresh Page
              </NeoButton>
              <NeoButton variant="secondary" onClick={() => window.location.href = '/'}>
                Go Home
              </NeoButton>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <details style={{ marginTop: '2rem', textAlign: 'left', whiteSpace: 'pre-wrap', color: 'var(--text-light)', fontSize: '0.8rem', background: 'rgba(0,0,0,0.05)', padding: '1rem', borderRadius: '8px' }}>
                <summary>Error Details</summary>
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </details>
            )}
          </NeoCard>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
