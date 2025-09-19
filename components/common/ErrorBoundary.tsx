import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
            <h2>Bir şeyler ters gitti.</h2>
            <pre className="text-xs bg-gray-100 p-2 rounded">{String(this.state.error)}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
