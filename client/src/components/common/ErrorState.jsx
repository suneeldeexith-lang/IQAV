import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorState = ({ message = "Failed to load data.", onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-slate-100 border-dashed w-full min-h-[200px]">
      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">Unable to Connect</h3>
      <p className="text-slate-500 max-w-md mb-6">{message}</p>
      
      {onRetry && (
        <button 
          onClick={onRetry}
          className="flex items-center px-6 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition shadow-md font-semibold"
        >
          <RefreshCw className="w-4 h-4 mr-2" /> Retry Connection
        </button>
      )}
    </div>
  );
};
export default ErrorState;
