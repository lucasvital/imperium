import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { AuthGuard } from './AuthGuard';
import { Login } from '../view/pages/Login';
import { Register } from '../view/pages/Register';
import { Dashboard } from '../view/pages/Dashboard';
import { Admin } from '../view/pages/Admin';
import { MentoradoDetails } from '../view/pages/MentoradoDetails';
import { AuthLayout } from '../view/pages/layouts/AuthLayout';

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthGuard isPrivate={false} />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
        </Route>

        <Route element={<AuthGuard isPrivate />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/mentorado/:mentoradoId" element={<MentoradoDetails />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
