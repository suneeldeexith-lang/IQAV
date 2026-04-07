import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { BookOpen, ChevronRight, Users } from 'lucide-react';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import clsx from 'clsx';

const CoordinatorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/coordinator/courses');
      setCourses(response.data.courses || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load coordinating courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  if (loading) return <Loader text="Loading your coordinating courses..." />;
  if (error) return <ErrorState message={error} onRetry={fetchCourses} />;

  // Group courses by course code
  const grouped = courses.reduce((acc, course) => {
    if (!acc[course.course_code]) acc[course.course_code] = [];
    acc[course.course_code].push(course);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Coordinator Dashboard</h1>
          <p className="text-slate-500 mt-1">Review and approve courses you coordinate.</p>
        </div>
        <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 px-4 py-2 rounded-xl">
          <Users className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-semibold text-purple-700">{courses.length} Sections</span>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No courses assigned for coordination.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([code, sections]) => (
            <div key={code}>
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
                {code} — {sections[0].course_name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sections.map((course) => {
                  const pct = Math.round(Number(course.completion_percentage));
                  return (
                    <Link
                      key={course.course_id}
                      to={`/coordinator/courses/${course.course_id}`}
                      className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-300 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-purple-50 rounded-xl">
                          <BookOpen className="w-4 h-4 text-purple-600" />
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-purple-500 transition-colors" />
                      </div>
                      <p className="font-bold text-slate-800 text-sm">Section {course.section} · Sem {course.semester}</p>
                      <p className="text-xs text-slate-400 mt-1">Faculty: {course.faculty?.name}</p>
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-500">Completion</span>
                          <span className={clsx("font-bold", pct === 100 ? "text-green-600" : "text-purple-600")}>{pct}%</span>
                        </div>
                        <div className="bg-slate-100 rounded-full h-1.5">
                          <div
                            className={clsx("h-1.5 rounded-full transition-all", pct === 100 ? "bg-green-500" : "bg-purple-500")}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoordinatorDashboard;
