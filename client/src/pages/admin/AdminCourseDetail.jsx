import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, CheckCircle2, XCircle, Download, Eye, UserCheck } from 'lucide-react';
import clsx from 'clsx';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import DocumentPreviewModal from '../../components/common/DocumentPreviewModal';

const STATUS_CONFIG = {
  PENDING:              { label: 'Pending Upload',           color: 'bg-slate-50 text-slate-500 border-slate-200' },
  SUBMITTED:            { label: 'Submitted',                color: 'bg-blue-50 text-blue-700 border-blue-200' },
  COORDINATOR_APPROVED: { label: 'Coordinator Approved ✓',   color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  APPROVED:             { label: 'IQAC Approved ✓',          color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  REJECTED:             { label: 'Rejected',                 color: 'bg-red-50 text-red-700 border-red-200' },
};

const AdminCourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedItem, setSelectedItem] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const [reviewAction, setReviewAction] = useState(null);
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

  useEffect(() => { fetchCourseData(); }, [id]);

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
      await fetchCourseData();
      setSelectedItem(null);
    } catch (err) {
      console.error(err);
      alert('Action failed: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) return <Loader text="Fetching compliance data..." />;
  if (error) return <ErrorState message={error} onRetry={fetchCourseData} />;

  const isFullyApproved = checklist.length > 0 && checklist.every(c => c.status_record?.status === 'APPROVED');
  const coordinatorApprovedCount = checklist.filter(c => c.status_record?.status === 'COORDINATOR_APPROVED').length;
  const approvedCount = checklist.filter(c => c.status_record?.status === 'APPROVED').length;
  const pendingCoordinatorCount = checklist.filter(c => ['PENDING','SUBMITTED'].includes(c.status_record?.status || 'PENDING')).length;

  return (
    <div className="space-y-6">
      {/* Header */}
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
        <button className="flex items-center px-4 py-2 bg-brand-50 text-brand-700 border border-brand-200 rounded-xl hover:bg-brand-100 transition shadow-sm font-bold">
          <Download className="w-4 h-4 mr-2" /> Download Package
        </button>
      </div>

      {/* Approval Flow Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Approval Flow</p>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-blue-200 px-4 py-2 rounded-xl">
            <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">1</span>
            <span className="text-sm font-semibold text-slate-700">Faculty Uploads</span>
          </div>
          <span className="text-slate-300 font-bold">→</span>
          <div className="flex items-center gap-2 bg-white border border-yellow-200 px-4 py-2 rounded-xl">
            <span className="w-6 h-6 rounded-full bg-yellow-500 text-white text-xs font-bold flex items-center justify-center">2</span>
            <span className="text-sm font-semibold text-slate-700">Coordinator Reviews</span>
            <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">{coordinatorApprovedCount} approved</span>
          </div>
          <span className="text-slate-300 font-bold">→</span>
          <div className="flex items-center gap-2 bg-white border border-emerald-200 px-4 py-2 rounded-xl">
            <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center">3</span>
            <span className="text-sm font-semibold text-slate-700">IQAC Final Approval</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{approvedCount} approved</span>
          </div>
        </div>
        {pendingCoordinatorCount > 0 && (
          <p className="text-xs text-slate-400 mt-3">⏳ {pendingCoordinatorCount} item(s) still waiting for coordinator review before you can approve them.</p>
        )}
      </div>

      {/* Checklist */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {checklist.map((item) => {
            const status = item.status_record?.status || 'PENDING';
            const statusConf = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
            const canIQACApprove = status === 'COORDINATOR_APPROVED';

            return (
              <div key={item.checklist_id} className="p-6 hover:bg-slate-50/50 transition">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 text-lg">{item.checklist_item_name}</h3>
                    <div className="flex gap-2 items-center mt-1 flex-wrap">
                      <span className={clsx("text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border", statusConf.color)}>
                        {statusConf.label}
                      </span>
                      <span className="text-sm font-medium text-slate-400">{item.category}</span>
                    </div>

                    {/* Show coordinator remarks if coordinator approved */}
                    {item.status_record?.coordinator_remarks && (
                      <div className="mt-2 flex items-start gap-2 bg-yellow-50 border border-yellow-100 px-3 py-2 rounded-lg">
                        <UserCheck className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-yellow-700">Coordinator's Remarks:</p>
                          <p className="text-xs text-yellow-700">{item.status_record.coordinator_remarks}</p>
                        </div>
                      </div>
                    )}

                    {/* Show IQAC remarks */}
                    {item.status_record?.remarks && (
                      <p className="inline-block text-sm text-slate-600 mt-2 italic bg-slate-50 px-3 py-1.5 border border-slate-100 rounded-lg shadow-sm">
                        <span className="font-semibold not-italic mr-1 text-slate-500">IQAC Note:</span>
                        {item.status_record.remarks}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 items-center flex-shrink-0">
                    {status !== 'PENDING' && (
                      <button
                        onClick={() => setPreviewItem(item)}
                        className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-sm font-bold rounded-xl shadow-sm transition"
                      >
                        <Eye className="w-4 h-4 mr-2" /> Preview
                      </button>
                    )}
                    {canIQACApprove && (
                      <>
                        <button onClick={() => handleReviewClick(item, 'APPROVED')} className="px-5 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition shadow-sm font-bold flex items-center">
                          <CheckCircle2 className="w-4 h-4 mr-1.5" /> IQAC Approve
                        </button>
                        <button onClick={() => handleReviewClick(item, 'REJECTED')} className="px-5 py-2.5 bg-red-50 text-red-700 border border-red-200 rounded-xl hover:bg-red-100 transition shadow-sm font-bold flex items-center">
                          <XCircle className="w-4 h-4 mr-1.5" /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* IQAC Approval Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                {reviewAction === 'APPROVED' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                {reviewAction === 'APPROVED' ? 'IQAC Final Approval' : 'Reject Submission'}
              </h3>
              <p className="text-sm font-medium text-slate-500 mt-1">{selectedItem.checklist_item_name}</p>
            </div>
            <form onSubmit={handleReviewSubmit} className="p-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {reviewAction === 'REJECTED' ? 'Reason for Rejection *' : 'IQAC Remarks (Optional)'}
              </label>
              <textarea
                value={remarks} onChange={(e) => setRemarks(e.target.value)} required={reviewAction === 'REJECTED'}
                className="w-full border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 mb-6 bg-slate-50"
                rows="3"
                placeholder={reviewAction === 'REJECTED' ? 'Explain what needs to be fixed...' : 'Add any IQAC notes...'}
              />
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setSelectedItem(null)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors">Cancel</button>
                <button type="submit" className={clsx("px-5 py-2.5 text-white rounded-xl font-bold shadow-md transition-all", reviewAction === 'APPROVED' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600')}>
                  {reviewAction === 'APPROVED' ? 'Confirm IQAC Approval' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
