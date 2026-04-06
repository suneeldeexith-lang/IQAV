import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { ArrowLeft, Upload, CheckCircle2, XCircle, Clock, FileText, Check, AlertTriangle, Eye } from 'lucide-react';
import clsx from 'clsx';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import DocumentPreviewModal from '../../components/common/DocumentPreviewModal';

const FacultyCourseDetail = () => {
  const { isOffline } = useAuth();
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [selectedItem, setSelectedItem] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [remarks, setRemarks] = useState('');

  const fetchCourse = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/faculty/courses/${id}`);
      setCourse(response.data.course);
      setChecklist(response.data.checklist || []);
    } catch (err) {
      console.error(err);
      setError('Backend API is currently unavailable. Unable to load checklist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const handleOpenUpload = (item) => {
    setSelectedItem(item);
    setFile(null);
    setRemarks('');
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    try {
      // 1. Upload file to backend
      const formData = new FormData();
      formData.append('files', file);
      await api.post(
        `/faculty/courses/${id}/checklist/${selectedItem.checklist_id}/upload`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      // 2. Mark as submitted for admin review
      await api.patch(
        `/faculty/courses/${id}/checklist/${selectedItem.checklist_id}/submit`,
        { remarks }
      );

      // 3. Refresh checklist from server
      await fetchCourse();
      setSelectedItem(null);
    } catch (err) {
      console.error(err);
      alert('Upload failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'APPROVED': return { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 border-emerald-200', label: 'Approved' };
      case 'REJECTED': return { icon: XCircle, color: 'text-orange-500', bg: 'bg-orange-50 border-orange-200', label: 'Rejected' };
      case 'SUBMITTED': return { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50 border-blue-200', label: 'Submitted' };
      default: return { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 border-red-200', label: 'Upload Required' };
    }
  };

  const [submitWarning, setSubmitWarning] = useState(false);
  const totalItems = checklist.length || 20; // Fallback to 20 if empty array
  const approvedItems = checklist.filter(c => c.status_record?.status === 'APPROVED').length;
  // An item is "pending" if it doesn't have a file attached (i.e., not SUBMITTED or APPROVED)
  const pendingItems = checklist.filter(c => {
    const status = c.status_record?.status || 'PENDING';
    return status !== 'SUBMITTED' && status !== 'APPROVED';
  });
  const completionPercentage = checklist.length > 0 ? Math.round((approvedItems / checklist.length) * 100) : 0;

  const handleGlobalSubmit = () => {
    if (pendingItems.length > 0) {
      const confirm = window.confirm(
        `You have ${pendingItems.length} checklist item(s) without files. Do you still want to submit with the files uploaded so far?`
      );
      if (!confirm) return;
    }
    alert('Course submitted to Admin for review.');
  };

  if (loading) return <Loader text="Loading course details..." />;
  if (error) return <ErrorState message={error} onRetry={fetchCourse} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Link to="/faculty" className="p-2 mr-4 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-brand-600 hover:border-brand-200 transition-colors shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{course?.course_name}</h1>
          <p className="text-slate-500">{course?.course_code} &bull; {course?.semester}</p>
        </div>
      </div>

      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex-1 mr-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-slate-700">Course Compliance Progress</span>
              <span className="text-sm font-bold text-slate-900">{completionPercentage}% Checklists Approved</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 shadow-inner">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${completionPercentage === 100 ? 'bg-emerald-500' : 'bg-brand-500'}`} 
                style={{width: `${completionPercentage}%`}}
              ></div>
            </div>
          </div>
          <button 
            onClick={handleGlobalSubmit}
            disabled={isOffline}
            className={clsx(
              "px-6 py-3 rounded-xl font-bold text-white transition-all shadow-md active:scale-95 disabled:scale-100 disabled:opacity-50",
              "bg-emerald-500 hover:bg-emerald-600 focus:ring-4 focus:ring-emerald-200"
            )}
          >
            Submit Course For Review
          </button>
        </div>

        {submitWarning && (
          <div className="animate-in fade-in slide-in-from-top-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-bold flex items-center shadow-sm">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Validation Blocked: All checklist documents must be uploaded before submission. You still have {pendingItems.length} pending checklist items.
          </div>
        )}
      
      {pendingItems.length > 0 && (
         <div className="bg-red-50/50 rounded-2xl p-6 border border-red-100 shadow-sm">
           <h3 className="text-lg font-bold text-red-800 mb-2 flex items-center">
             <AlertTriangle className="w-5 h-5 mr-2" /> Action Required: Missing Documents
           </h3>
           <p className="text-red-600 text-sm font-medium mb-4">The following mandatory documents currently have no valid files uploaded or have been rejected.</p>
           <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
             {pendingItems.map(p => (
                <li key={p.checklist_id} className="bg-white border border-red-200 rounded-lg px-3 py-2 text-sm font-bold text-red-700 shadow-sm flex items-center">
                   <div className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></div>
                   {p.checklist_item_name}
                </li>
             ))}
           </ul>
         </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800">Compliance Checklist</h2>
        </div>
        
        <div className="divide-y divide-slate-100">
          {checklist.map((item) => {
            const status = item.status_record?.status || 'PENDING';
            const { icon: StatusIcon, color, bg, label } = getStatusConfig(status);
            
            return (
              <div key={item.checklist_id} className="p-6 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={clsx("p-3 rounded-xl border mt-0.5 shadow-sm", bg)}>
                    <StatusIcon className={clsx("w-6 h-6", color)} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-lg">{item.checklist_item_name}</h3>
                    <p className="text-sm font-medium text-slate-500 mb-2">{item.category}</p>
                    
                    {item.status_record?.remarks && (
                      <div className="text-sm bg-slate-100 px-3 py-2 rounded-lg text-slate-700 italic border border-slate-200 inline-block shadow-sm">
                        <span className="font-semibold not-italic mr-1 text-slate-500">Note:</span> 
                        {item.status_record.remarks}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {status !== 'PENDING' && (
                     <button
                        onClick={() => setPreviewItem(item)}
                        className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-sm font-bold rounded-xl shadow-sm transition"
                     >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview & History
                     </button>
                  )}
                  {status === 'APPROVED' ? (
                    <span className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-100 text-emerald-700 text-sm font-bold border border-emerald-200 shadow-sm cursor-default">
                      <Check className="w-4 h-4 mr-1" /> Approved & Locked
                    </span>
                  ) : status === 'SUBMITTED' ? (
                     <span className="inline-flex items-center px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-sm font-semibold border border-blue-200 shadow-sm cursor-default">
                      <Clock className="w-4 h-4 mr-1" /> Submitted
                    </span>
                  ) : (
                    <button
                      onClick={() => handleOpenUpload(item)}
                      disabled={isOffline}
                      className={clsx(
                        "inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm border",
                        status === 'REJECTED' 
                          ? "bg-white text-orange-600 border-orange-200 hover:bg-orange-50" 
                          : "bg-white text-brand-600 border-brand-200 hover:bg-brand-50",
                        isOffline && "opacity-50 cursor-not-allowed hover:bg-white saturate-50"
                      )}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {status === 'REJECTED' ? 'Replace File' : 'Upload File'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Upload Modal Overlay */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 transform transition-all">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Upload Required Document</h3>
                <p className="text-sm text-slate-500 font-medium">{selectedItem.checklist_item_name}</p>
              </div>
              <button 
                onClick={() => setSelectedItem(null)}
                className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 border border-slate-200 shadow-sm transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUploadSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Select File</label>
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:bg-brand-50 hover:border-brand-300 transition-colors cursor-pointer group">
                  <input 
                    type="file" 
                    onChange={e => setFile(e.target.files[0])}
                    className="hidden" 
                    id="file-upload"
                    required
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3 group-hover:text-brand-500 transition-colors" />
                    {file ? (
                      <span className="font-semibold text-brand-600">{file.name}</span>
                    ) : (
                      <span className="text-sm font-medium text-slate-600">Click to browse or drag and drop<br/><span className="text-xs text-slate-400 font-normal mt-1 block">PDF, DOCX up to 10MB</span></span>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Remarks (Optional)</label>
                <textarea 
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow bg-slate-50 placeholder:text-slate-400 font-medium"
                  rows="3"
                  placeholder="Add any notes for the admin..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setSelectedItem(null)}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={uploading || !file}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {uploading ? 'Uploading...' : 'Submit Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Embedded Document Explorer mapping */}
      {previewItem && (
        <DocumentPreviewModal 
          courseId={id} 
          checklistId={previewItem.checklist_id} 
          itemName={previewItem.checklist_item_name}
          onClose={() => setPreviewItem(null)} 
        />
      )}
    </div>
  );
};

export default FacultyCourseDetail;
