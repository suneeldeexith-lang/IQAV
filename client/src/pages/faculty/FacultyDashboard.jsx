import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { BookOpen, ChevronRight, Clock, AlertTriangle } from 'lucide-react';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';

const FacultyDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/faculty/courses');
      setCourses(response.data.courses || []);
    } catch (err) {
      console.error(err);
      setError('Backend API is currently unavailable. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  if (loading) return <Loader text="Fetching your assigned courses..." />;
  if (error) return <ErrorState message={error} onRetry={fetchCourses} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Overview</h1>
          <p className="text-slate-500 mt-1">Manage your assigned courses and compliance tasks.</p>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          // Strict compliance calculation mock based on percentage and 20 total items
          const TOTAL_ITEMS = 20;
          const uploadedCount = Math.round((Number(course.completion_percentage) / 100) * TOTAL_ITEMS);
          const pendingCount = TOTAL_ITEMS - uploadedCount;
          
          return (
          <div key={course.course_id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition group overflow-hidden relative">
            {pendingCount > 0 && (
               <div className="absolute top-0 right-0 bg-red-50 text-red-600 px-3 py-1.5 rounded-bl-xl text-xs font-bold border-b border-l border-red-100 flex items-center shadow-sm">
                 <AlertTriangle className="w-3 h-3 mr-1" /> {pendingCount} documents pending
               </div>
            )}
            <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${Number(course.completion_percentage) === 100 ? 'bg-emerald-50 text-emerald-600' : 'bg-brand-50 text-brand-600'}`}>
              <BookOpen className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1 pr-6">{course.course_name}</h2>
            <p className="text-slate-500 font-medium mb-6">{course.course_code} &bull; {course.semester}</p>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-slate-700">Course Compliance</span>
                <span className={`text-sm font-bold ${Number(course.completion_percentage) === 100 ? 'text-emerald-500' : 'text-slate-900'}`}>{Number(course.completion_percentage)}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 mb-3 shadow-inner">
                <div className={`h-2 rounded-full transition-all duration-500 ${Number(course.completion_percentage) === 100 ? 'bg-emerald-500' : 'bg-brand-500'}`} style={{width: `${Number(course.completion_percentage)}%`}}></div>
              </div>
              <div className="flex gap-4 text-xs font-medium text-slate-500 pt-1 border-t border-slate-50 border-dashed">
                 <span className="text-brand-600 font-bold bg-brand-50 px-2 py-0.5 rounded-md">Uploaded: {uploadedCount} / {TOTAL_ITEMS}</span>
                 <span className={pendingCount > 0 ? "text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md" : "text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md"}>Pending: {pendingCount} / {TOTAL_ITEMS}</span>
              </div>
            </div>

            <Link to={`/faculty/courses/${course.course_id}`} className={`block w-full py-2.5 text-center rounded-xl font-bold transition-all border ${Number(course.completion_percentage) === 100 ? 'bg-slate-50 text-slate-600 hover:bg-slate-100' : 'bg-brand-50 text-brand-700 border-brand-100 hover:bg-brand-100 shadow-sm'}`}>
              Manage Submissions
            </Link>
          </div>
        )})}
      </div>
      
      {courses.length === 0 && !error && (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No courses assigned</h3>
          <p className="text-slate-500 mt-1">Check back later when the semester begins.</p>
        </div>
      )}
    </div>
  );
};

export default FacultyDashboard;
