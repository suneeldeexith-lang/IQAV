import React from 'react';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("UI Encountered a fatal Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
           <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 max-w-lg w-full">
              <div className="w-16 h-16 bg-red-50 text-red-500 flex items-center justify-center rounded-2xl mx-auto mb-6 shadow-inner">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h1>
              <p className="text-slate-500 font-medium mb-8">The component encountered a fatal runtime error and was caught by the boundary to prevent continuous looping.</p>
              <button 
                 onClick={() => window.location.reload()} 
                 className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-md transition-colors"
               >
                 Reload Screen
              </button>
           </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default GlobalErrorBoundary;
