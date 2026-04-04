import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Search, Filter, ChevronRight, FileDown } from 'lucide-react';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/courses');
      setCourses(response.data.courses || []);
    } catch (err) {
      console.error(err);
      setError('Unable to fetch course directory. Please check server status.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCourses();
  }, []);

  if (loading) return <Loader text="Loading master course list..." />;
  if (error) return <ErrorState message={error} onRetry={fetchCourses} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Master Course List</h1>
          <p className="text-slate-500 mt-1">Review and manage all courses institutional-wide.</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition font-semibold shadow-md">
          <FileDown className="w-4 h-4 mr-2" /> Export Report
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex gap-4 bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
            <input type="text" placeholder="Search courses..." className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <button className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl flex items-center hover:bg-slate-100 font-medium">
            <Filter className="w-4 h-4 mr-2" /> Filter List
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white border-b border-slate-100 text-sm font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Course Info</th>
                <th className="px-6 py-4">Faculty</th>
                <th className="px-6 py-4">Semester</th>
                <th className="px-6 py-4">Compliance Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {courses.map(course => (
                <tr key={course.course_id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{course.course_name}</p>
                    <p className="text-slate-500">{course.course_code}</p>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">{course.faculty?.name}</td>
                  <td className="px-6 py-4 text-slate-500 font-medium">{course.semester}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 max-w-[120px] bg-slate-100 rounded-full h-2 shadow-inner">
                         <div className={`h-2 rounded-full ${Number(course.completion_percentage) === 100 ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 'bg-gradient-to-r from-brand-500 to-brand-400'}`} style={{width: `${Number(course.completion_percentage)}%`}}></div>
                      </div>
                      <span className="font-bold text-slate-700">{Number(course.completion_percentage)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/admin/courses/${course.course_id}`} className="inline-flex items-center bg-brand-50 border border-brand-200 px-3 py-1.5 rounded-lg text-brand-700 font-bold hover:bg-brand-100 transition-colors">
                      Review <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default AdminCourses;
