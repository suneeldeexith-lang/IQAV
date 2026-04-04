import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

import Login from '../pages/auth/Login';
import AdminLayout from '../components/layout/AdminLayout';
import FacultyLayout from '../components/layout/FacultyLayout';

import FacultyDashboard from '../pages/faculty/FacultyDashboard';
import FacultyCourseDetail from '../pages/faculty/FacultyCourseDetail';

import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminCourses from '../pages/admin/AdminCourses';
import AdminCourseDetail from '../pages/admin/AdminCourseDetail';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        } 
      >
        <Route index element={<AdminDashboard />} />
        <Route path="courses" element={<AdminCourses />} />
        <Route path="courses/:id" element={<AdminCourseDetail />} />
      </Route>

      {/* Faculty Routes */}
      <Route 
        path="/faculty" 
        element={
          <ProtectedRoute allowedRoles={['FACULTY']}>
            <FacultyLayout />
          </ProtectedRoute>
        } 
      >
        <Route index element={<Navigate to="courses" replace />} />
        <Route path="courses" element={<FacultyDashboard />} />
        <Route path="courses/:id" element={<FacultyCourseDetail />} />
      </Route>

      {/* Catch all */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRouter;
