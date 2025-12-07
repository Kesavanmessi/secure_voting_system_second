import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-900 text-white p-8 flex flex-col items-center justify-center">
                    <h1 className="text-3xl font-bold text-red-500 mb-4">Something went wrong.</h1>
                    <div className="bg-slate-800 p-6 rounded-lg max-w-2xl w-full overflow-auto text-left">
                        <details className="whitespace-pre-wrap">
                            <summary className="cursor-pointer text-cyan-400 mb-2">Error Details</summary>
                            <p className="font-mono text-red-300 mb-2">{this.state.error && this.state.error.toString()}</p>
                            <p className="font-mono text-xs text-slate-400">{this.state.errorInfo && this.state.errorInfo.componentStack}</p>
                        </details>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-bold"
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
