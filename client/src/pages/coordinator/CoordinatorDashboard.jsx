import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { BookOpen, ChevronRight, Users, Upload } from 'lucide-react';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import clsx from 'clsx';

const CoordinatorDashboard = () => {
  const [coordinatingCourses, setCoordinatingCourses] = useState([]);
  const [teachingCourses, setTeachingCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const [coordRes, teachRes] = await Promise.all([
        api.get('/coordinator/courses'),
        api.get('/faculty/courses'),
      ]);
      setCoordinatingCourses(coordRes.data.courses || []);
      setTeachingCourses(teachRes.data.courses || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  if (loading) return <Loader text="Loading your courses..." />;
  if (error) return <ErrorState message={error} onRetry={fetchCourses} />;

  // Group coordinating courses by course code
  const grouped = coordinatingCourses.reduce((acc, course) => {
    if (!acc[course.course_code]) acc[course.course_code] = [];
    acc[course.course_code].push(course);
    return acc;
  }, {});

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Coordinator Dashboard</h1>
          <p className="text-slate-500 mt-1">Upload your course documents and review sections you coordinate.</p>
        </div>
      </div>

      {/* ── Section 1: My Teaching Courses (upload docs) ── */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-50 rounded-xl">
            <Upload className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">My Teaching Courses</h2>
            <p className="text-xs text-slate-400">Courses you teach — upload your compliance documents here</p>
          </div>
        </div>

        {teachingCourses.length === 0 ? (
          <p className="text-sm text-slate-400 pl-2">No teaching courses found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachingCourses.map((course) => {
              const pct = Math.round(Number(course.completion_percentage));
              return (
                <Link
                  key={course.course_id}
                  to={`/faculty/courses/${course.course_id}`}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-blue-50 rounded-xl">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Upload Docs</span>
                  </div>
                  <p className="font-bold text-slate-800 text-sm">{course.course_name}</p>
                  <p className="text-xs text-slate-400 mt-1">{course.course_code} · Section {course.section} · Sem {course.semester}</p>
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500">Completion</span>
                      <span className={clsx("font-bold", pct === 100 ? "text-green-600" : "text-blue-600")}>{pct}%</span>
                    </div>
                    <div className="bg-slate-100 rounded-full h-1.5">
                      <div
                        className={clsx("h-1.5 rounded-full transition-all", pct === 100 ? "bg-green-500" : "bg-blue-500")}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Section 2: Courses I Coordinate (review & approve) ── */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-50 rounded-xl">
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Courses I Coordinate</h2>
            <p className="text-xs text-slate-400">Review and give final approval for these sections</p>
          </div>
          <span className="ml-auto text-sm font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full">
            {coordinatingCourses.length} Sections
          </span>
        </div>

        {coordinatingCourses.length === 0 ? (
          <p className="text-sm text-slate-400 pl-2">No coordinating courses found.</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([code, sections]) => (
              <div key={code}>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  {code} — {sections[0].course_name}
                </h3>
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
    </div>
  );
};

export default CoordinatorDashboard;
