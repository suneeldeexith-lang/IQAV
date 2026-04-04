import { useState, useEffect } from 'react';
import { XCircle, Download, ExternalLink, History, Clock } from 'lucide-react';
import api from '../../services/api';
import Loader from './Loader';
import ErrorState from './ErrorState';
import { useAuth } from '../../contexts/AuthContext';

const DocumentPreviewModal = ({ courseId, checklistId, itemName, onClose }) => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = user.role === 'ADMIN' ? `/admin/courses/${courseId}/checklist/${checklistId}/history` : `/faculty/courses/${courseId}/checklist/${checklistId}/history`;
      const response = await api.get(endpoint);
      const fetchedHistory = response.data.history || [];
      setHistory(fetchedHistory);
      if (fetchedHistory.length > 0) {
        setSelectedSubmission(fetchedHistory[0]); // Default to latest version
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load document history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId && checklistId) {
      fetchHistory();
    }
  }, [courseId, checklistId]);

  if (!courseId) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md transition-opacity">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-[85vh] overflow-hidden border border-slate-200 flex flex-col md:flex-row transform transition-all animate-in fade-in zoom-in-95">
        
        {/* Left Side: Document Previewer */}
        <div className="flex-1 bg-slate-100 flex flex-col h-full border-r border-slate-200 relative">
          <div className="px-6 py-4 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm z-10">
            <div>
              <h3 className="font-bold text-lg text-slate-900">{itemName}</h3>
              {selectedSubmission && (
                 <p className="text-sm font-medium text-slate-500 flex items-center mt-0.5">
                   Viewing Version {selectedSubmission.version} <span className="mx-2">&bull;</span> <span className="truncate max-w-[300px]">{selectedSubmission.file_name}</span>
                 </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {selectedSubmission && (
                <a 
                  href={selectedSubmission.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-sm rounded-xl transition"
                >
                  <ExternalLink className="w-4 h-4 mr-2" /> Open Native
                </a>
              )}
              <button 
                onClick={onClose}
                className="p-2 md:hidden bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 shadow-sm transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden bg-slate-50 flex items-center justify-center p-4">
             {loading ? (
                <Loader text="Loading document streams..." />
             ) : error ? (
                <ErrorState message={error} onRetry={fetchHistory} />
             ) : selectedSubmission ? (
                <iframe 
                  src={selectedSubmission.file_url} 
                  className="w-full h-full rounded-xl shadow-sm border border-slate-200 bg-white"
                  title="Document Preview"
                >
                  <p className="p-4 text-center text-slate-500 font-medium">Your browser does not support iframes. <a href={selectedSubmission.file_url} className="text-brand-600 underline">Download the file here.</a></p>
                </iframe>
             ) : (
                <div className="text-center font-bold text-slate-400">
                   <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                   No document has been uploaded for this checklist yet.
                </div>
             )}
          </div>
        </div>

        {/* Right Side: Version History Sidebar */}
        <div className="w-full md:w-96 bg-white shrink-0 flex flex-col h-full z-20 shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.05)]">
           <div className="px-6 py-5 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
             <h3 className="font-bold text-slate-800 flex items-center">
               <History className="w-5 h-5 mr-2 text-slate-500" /> File History
             </h3>
             <button 
                onClick={onClose}
                className="hidden md:block p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 border border-slate-200 shadow-sm transition-colors"
                title="Close Viewer"
              >
                <XCircle className="w-5 h-5" />
              </button>
           </div>
           
           <div className="flex-1 overflow-y-auto p-6 space-y-6">
             {loading ? (
                <div className="text-center mt-10">
                   <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-indigo-500 animate-spin mx-auto mb-4"></div>
                   <span className="text-sm font-bold text-slate-400">Syncing timelines...</span>
                </div>
             ) : history.length === 0 ? (
                <div className="text-center mt-10 text-sm font-bold text-slate-400">No revisions found.</div>
             ) : (
                <div className="relative border-l-2 border-indigo-100 ml-3 space-y-8 pb-4">
                  {history.map((doc, idx) => (
                     <div 
                        key={doc.submission_id}
                        className={`relative pl-6 cursor-pointer group transition`}
                        onClick={() => setSelectedSubmission(doc)}
                     >
                       <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full border-4 border-white shadow-sm transition-colors ${selectedSubmission?.submission_id === doc.submission_id ? 'bg-indigo-500 shadow-indigo-200' : 'bg-slate-300 group-hover:bg-indigo-300'}`}></div>
                       
                       <div className={`p-4 rounded-xl border transition-all ${selectedSubmission?.submission_id === doc.submission_id ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-100 hover:border-indigo-100 hover:bg-slate-50/50'}`}>
                         <div className="flex justify-between items-start mb-1">
                           <span className="text-sm font-bold text-slate-900">
                             Version {doc.version}
                           </span>
                           {doc.is_latest && (
                             <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Current</span>
                           )}
                         </div>
                         <p className="text-xs font-semibold text-slate-500 truncate mb-3" title={doc.file_name}>{doc.file_name}</p>
                         
                         <div className="text-xs text-slate-400 mb-4 whitespace-nowrap">
                           Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()} at {new Date(doc.uploaded_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                         </div>

                         <a 
                           href={doc.file_url} 
                           download={doc.file_name}
                           onClick={(e) => e.stopPropagation()} // Prevent selecting the div from the button
                           className="inline-flex w-full justify-center items-center px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 text-xs font-bold rounded-lg transition-colors"
                         >
                           <Download className="w-3.5 h-3.5 mr-2" /> Download
                         </a>
                       </div>
                     </div>
                  ))}
                </div>
             )}
           </div>
        </div>

      </div>
    </div>
  );
};

export default DocumentPreviewModal;
