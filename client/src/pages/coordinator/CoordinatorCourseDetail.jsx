import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { CheckCircle, XCircle, FileText, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import clsx from 'clsx';

const STATUS_CONFIG = {
  PENDING:        { label: 'Pending Upload',         color: 'bg-slate-100 text-slate-600' },
  SUBMITTED:      { label: 'Under Admin Review',     color: 'bg-yellow-100 text-yellow-700' },
  ADMIN_APPROVED: { label: 'Awaiting Your Review',   color: 'bg-blue-100 text-blue-700' },
  APPROVED:       { label: 'Fully Approved',         color: 'bg-green-100 text-green-700' },
  REJECTED:       { label: 'Rejected',               color: 'bg-red-100 text-red-700' },
};

const CoordinatorCourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedItem, setExpandedItem] = useState(null);
  const [remarks, setRemarks] = useState({});
  const [submitting, setSubmitting] = useState(null);

  const fetchCourse = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/coordinator/courses/${id}`);
      setCourse(res.data.course);
      setChecklist(res.data.checklist);
    } catch (err) {
      setError('Failed to load course details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourse(); }, [id]);

  const handleReview = async (checklistStatusId, status) => {
    setSubmitting(checklistStatusId + status);
    try {
      await api.patch(`/coordinator/checklist/${checklistStatusId}/status`, {
        status,
        remarks: remarks[checklistStatusId] || ''
      });
      await fetchCourse();
      setExpandedItem(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status.');
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) return <Loader text="Loading course..." />;
  if (error) return <ErrorState message={error} onRetry={fetchCourse} />;

  const pendingReview = checklist.filter(c => c.status_record?.status === 'ADMIN_APPROVED');
  const approved = checklist.filter(c => c.status_record?.status === 'APPROVED');
  const rejected = checklist.filter(c => c.status_record?.status === 'REJECTED');

  // Group by category
  const categories = ['COURSE_PLANNING', 'OBE', 'TEACHING_LEARNING', 'ASSESSMENT', 'FEEDBACK'];
  const categoryLabels = {
    COURSE_PLANNING: 'Course Planning',
    OBE: 'OBE',
    TEACHING_LEARNING: 'Teaching & Learning',
    ASSESSMENT: 'Assessment',
    FEEDBACK: 'Feedback',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/coordinator" className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{course?.course_name}</h1>
          <p className="text-slate-500 text-sm">{course?.course_code} · Section {course?.section} · Semester {course?.semester} · Faculty: {course?.faculty?.name}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
          <p className="text-2xl font-bold text-blue-600">{pendingReview.length}</p>
          <p className="text-xs text-blue-500 mt-1">Awaiting Your Review</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
          <p className="text-2xl font-bold text-green-600">{approved.length}</p>
          <p className="text-xs text-green-500 mt-1">Fully Approved</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center border border-red-100">
          <p className="text-2xl font-bold text-red-600">{rejected.length}</p>
          <p className="text-xs text-red-500 mt-1">Rejected</p>
        </div>
      </div>

      {pendingReview.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700 font-medium">
          ✅ {pendingReview.length} item(s) have been approved by Admin and are waiting for your review. Click each item to approve or reject.
        </div>
      )}

      {/* Checklist by Category */}
      {categories.map(cat => {
        const items = checklist.filter(i => i.category === cat);
        if (items.length === 0) return null;
        return (
          <div key={cat}>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{categoryLabels[cat]}</h2>
            <div className="space-y-2">
              {items.map((item) => {
                const statusRecord = item.status_record;
                const status = statusRecord?.status || 'PENDING';
                const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
                const isExpanded = expandedItem === item.checklist_id;
                const canReview = status === 'ADMIN_APPROVED';
                const latestFile = statusRecord?.submissions?.[0];

                return (
                  <div key={item.checklist_id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div
                      className={clsx("flex items-center justify-between p-4", canReview && "cursor-pointer hover:bg-slate-50")}
                      onClick={() => canReview && setExpandedItem(isExpanded ? null : item.checklist_id)}
                    >
                      <div className="flex items-center gap-3">
                        <span className={clsx("px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap", config.color)}>
                          {config.label}
                        </span>
                        <span className="font-medium text-slate-800 text-sm">{item.checklist_item_name}</span>
                      </div>
                      {canReview && (
                        isExpanded
                          ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      )}
                    </div>

                    {isExpanded && canReview && (
                      <div className="border-t border-slate-100 p-4 bg-slate-50 space-y-4">
                        {latestFile && (
                          <div className="flex items-center gap-2 text-sm">
                            <FileText className="w-4 h-4 text-slate-400" />
                            <a href={latestFile.file_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium">
                              {latestFile.file_name}
                            </a>
                          </div>
                        )}
                        {statusRecord?.remarks && (
                          <p className="text-xs text-slate-500 italic bg-white border border-slate-200 rounded-lg px-3 py-2">
                            Admin remarks: {statusRecord.remarks}
                          </p>
                        )}
                        <textarea
                          placeholder="Add your remarks (optional)..."
                          className="w-full border border-slate-200 rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-300"
                          rows={3}
                          value={remarks[statusRecord?.id] || ''}
                          onChange={(e) => setRemarks(prev => ({ ...prev, [statusRecord?.id]: e.target.value }))}
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleReview(statusRecord?.id, 'APPROVED')}
                            disabled={!!submitting}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50"
                          >
                            <CheckCircle className="w-4 h-4" /> Approve
                          </button>
                          <button
                            onClick={() => handleReview(statusRecord?.id, 'REJECTED')}
                            disabled={!!submitting}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4" /> Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CoordinatorCourseDetail;
