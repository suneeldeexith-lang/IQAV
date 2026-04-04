import { useState, useEffect } from 'react';
import api from '../../services/api';
import { BookOpen, Users, CheckSquare, Clock } from 'lucide-react';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.data);
    } catch (err) {
      console.error(err);
      setError('Unable to fetch organization metrics. Please verify backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <Loader text="Aggregating metrics..." />;
  if (error) return <ErrorState message={error} onRetry={fetchStats} />;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1">Institutional compliance metrics across all departments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Courses', value: stats?.totalCourses || 0, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Total Faculty', value: stats?.totalFaculty || 0, icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
          { label: 'Overall Compliance', value: `${stats?.overallCompliance || 0}%`, icon: CheckSquare, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Pending Reviews', value: stats?.pendingReviews || 0, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center">
            <div className={`p-4 rounded-xl ${stat.bg} mr-4`}>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <h2 className="text-2xl font-bold text-slate-900">{stat.value}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
         <h2 className="text-lg font-bold text-slate-800 mb-4">Under-Compliant Courses Action Required</h2>
         <div className="text-center py-10 text-slate-500 border border-dashed border-slate-200 rounded-xl">Analytics API linkage pending. Displaying static metrics above.</div>
      </div>
    </div>
  );
};
export default AdminDashboard;
