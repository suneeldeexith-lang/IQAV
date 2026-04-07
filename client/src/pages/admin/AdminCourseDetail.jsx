import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, CheckCircle2, XCircle, Clock, Download, FileDown, Eye } from 'lucide-react';
import clsx from 'clsx';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import DocumentPreviewModal from '../../components/common/DocumentPreviewModal';

const AdminCourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Action Modal State
  const [selectedItem, setSelectedItem] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const [reviewAction, setReviewAction] = useState(null); // 'ADMIN_APPROVED' or 'REJECTED'
  const [remarks, setRemarks] = useState('');

  const fetchCourseData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/admin/courses/${id}`);
      setCourse(response.data.course);
      setChecklist(response.data.checklist || []);
    } catch (err) {
      console.error(err);
      setError('Unable to load course submissions. Server might be down.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const handleReviewClick = (item, action) => {
    setSelectedItem(item);
    setReviewAction(action);
    setRemarks('');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/admin/checklist/${selectedItem.status_record.id}/status`, {
        status: reviewAction,
        remarks,
      });
      // Refresh from server so completion % and statuses are accurate
      await fetchCourseData();
      setSelectedItem(null);
    } catch (err) {
      console.error(err);
      alert('Action failed: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) return <Loader text="Fetching compliance data..." />;
  if (error) return <ErrorState message={error} onRetry={fetchCourseData} />;

  const isFullyApproved = checklist.length > 0 && checklist.every(c => ['ADMIN_APPROVED','APPROVED'].includes(c.status_record?.status));
  const hasPendingItems = checklist.some(c => {
    const s = c.status_record?.status;
    return s !== 'SUBMITTED' && s !== 'ADMIN_APPROVED' && s !== 'APPROVED';
  });

  const handleGlobalApproval = () => {
    if (hasPendingItems) {
      alert("Validation Error: Cannot approve course until all checklist documents are submitted by the faculty.");
      return;
    }
    alert("Course officially marked as Fully Compliant!");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link to="/admin/courses" className="p-2 mr-4 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-brand-600 hover:border-brand-200 transition-colors shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{course?.course_name}</h1>
            <p className="text-slate-500 font-medium">{course?.course_code} &bull; Taught by <span className="text-slate-700">{course?.faculty?.name}</span></p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center px-4 py-2 bg-brand-50 text-brand-700 border border-brand-200 rounded-xl hover:bg-brand-100 transition shadow-sm font-bold">
            <Download className="w-4 h-4 mr-2" /> Download Package
          </button>
          <button 
            onClick={handleGlobalApproval}
            disabled={hasPendingItems || isFullyApproved}
            className={clsx(
              "flex items-center px-5 py-2 text-white border rounded-xl transition shadow-md font-bold disabled:opacity-50",
              isFullyApproved ? "bg-slate-400 border-slate-400 cursor-not-allowed" : 
              hasPendingItems ? "bg-slate-300 border-slate-400 cursor-not-allowed" : "bg-emerald-500 hover:bg-emerald-600 border-emerald-600"
            )}
          >
            {isFullyApproved ? "Fully Compliant" : "Mark Course Fully Compliant"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {checklist.map((item) => {
            const status = item.status_record?.status || 'PENDING';
            const isSubmitted = status === 'SUBMITTED';
            
            return (
              <div key={item.checklist_id} className="p-6 hover:bg-slate-50/50 transition flex justify-between items-center gap-4">
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg">{item.checklist_item_name}</h3>
                  <div className="flex gap-2 items-center mt-1">
                     <span className={clsx(
                       "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border",
                       status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                       status === 'ADMIN_APPROVED' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                       status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                       status === 'SUBMITTED' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 text-slate-500 border-slate-200'
                     )}>
                       {status === 'ADMIN_APPROVED' ? 'Admin Approved' : status}
                     </span>
                     <span className="text-sm font-medium text-slate-400">{item.category}</span>
                  </div>
                  {item.status_record?.remarks && (
                    <p className="inline-block text-sm text-slate-600 mt-2 italic bg-slate-50 px-3 py-1.5 border border-slate-100 rounded-lg shadow-sm">
                       <span className="font-semibold not-italic mr-1 text-slate-500">Note:</span> 
                       {item.status_record.remarks}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 items-center">
                  {status !== 'PENDING' && (
                     <button
                        onClick={() => setPreviewItem(item)}
                        className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-sm font-bold rounded-xl shadow-sm transition"
                     >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview Document
                     </button>
                  )}
                  {isSubmitted && (
                    <>
                      <button onClick={() => handleReviewClick(item, 'ADMIN_APPROVED')} className="px-5 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition shadow-sm font-bold flex items-center">
                        <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve
                      </button>
                      <button onClick={() => handleReviewClick(item, 'REJECTED')} className="px-5 py-2.5 bg-red-50 text-red-700 border border-red-200 rounded-xl hover:bg-red-100 transition shadow-sm font-bold flex items-center">
                        <XCircle className="w-4 h-4 mr-1.5" /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                {reviewAction === 'ADMIN_APPROVED' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                {reviewAction === 'ADMIN_APPROVED' ? 'Approve Submission' : 'Reject Submission'}
              </h3>
              <p className="text-sm font-medium text-slate-500 mt-1">{selectedItem.checklist_item_name}</p>
            </div>
            <form onSubmit={handleReviewSubmit} className="p-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">{reviewAction === 'REJECTED' ? 'Reason for Rejection *' : 'Feedback Notes (Optional)'}</label>
              <textarea
                value={remarks} onChange={(e) => setRemarks(e.target.value)} required={reviewAction === 'REJECTED'}
                className="w-full border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 mb-6 bg-slate-50"
                rows="3" placeholder={`Provide feedback to the faculty ${reviewAction === 'REJECTED' ? 'on what needs fixing...' : 'saying good job...'}`}
              ></textarea>
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setSelectedItem(null)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors">Cancel</button>
                <button type="submit" className={clsx("px-5 py-2.5 text-white rounded-xl font-bold shadow-md transition-all", reviewAction === 'ADMIN_APPROVED' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600')}>
                  Confirm {reviewAction === 'ADMIN_APPROVED' ? 'Approval' : 'Rejection'}
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
export default AdminCourseDetail;
