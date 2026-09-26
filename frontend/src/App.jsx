import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/public/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import DoctorRegister from "./pages/auth/DoctorRegister";
import RegistrationPending from "./pages/auth/RegistrationPending";
import ClerkSignInPage from "./pages/auth/ClerkSignInPage";
import ClerkSignUpPage from "./pages/auth/ClerkSignUpPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import OperatorDashboard from "./pages/operator/OperatorDashboard";
import NewScreening from "./pages/operator/NewScreening";
import ScreeningHistory from "./pages/operator/ScreeningHistory";
import Reports from "./pages/operator/Reports";
import Settings from "./pages/operator/Settings";
import Screening from "./pages/operator/Screening";
import ScreeningResult from "./pages/operator/ScreeningResult";
import Explainability from "./pages/operator/Explainability";

import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import ReviewQueuePage from "./pages/doctor/ReviewQueuePage";
import PatientReviewPage from "./pages/doctor/PatientReviewPage";

function App() {
  return (
    <Routes>
      {/* Public Landing */}
      <Route path="/" element={<Home />} />

      {/* Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/login/operator" element={<Login initialRole="operator" />} />
      <Route path="/login/doctor" element={<Login initialRole="ophthalmologist" />} />
      <Route path="/login/ophthalmologist" element={<Login initialRole="ophthalmologist" />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register/doctor" element={<DoctorRegister />} />
      <Route path="/registration-pending" element={<RegistrationPending />} />

      {/* Clerk Authentication Routes */}
      <Route path="/clerk-login/*" element={<ClerkSignInPage />} />
      <Route path="/clerk-register/*" element={<ClerkSignUpPage />} />

      {/* Screening Operator Suite (Protected) */}
      <Route
        path="/operator"
        element={
          <ProtectedRoute allowedRole="operator">
            <OperatorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/operator/new-screening"
        element={
          <ProtectedRoute allowedRole="operator">
            <NewScreening />
          </ProtectedRoute>
        }
      />
      <Route
        path="/operator/history"
        element={
          <ProtectedRoute allowedRole="operator">
            <ScreeningHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/operator/reports"
        element={
          <ProtectedRoute allowedRole="operator">
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/operator/settings"
        element={
          <ProtectedRoute allowedRole="operator">
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/operator/screening"
        element={
          <ProtectedRoute allowedRole="operator">
            <Screening />
          </ProtectedRoute>
        }
      />
      <Route
        path="/operator/result"
        element={
          <ProtectedRoute allowedRole="operator">
            <ScreeningResult />
          </ProtectedRoute>
        }
      />
      <Route
        path="/operator/result/:screeningId"
        element={
          <ProtectedRoute allowedRole="operator">
            <ScreeningResult />
          </ProtectedRoute>
        }
      />
      <Route
        path="/operator/explainability"
        element={
          <ProtectedRoute allowedRole="operator">
            <Explainability />
          </ProtectedRoute>
        }
      />

      {/* Ophthalmologist / Clinical Suite (Protected) */}
      <Route
        path="/doctor"
        element={
          <ProtectedRoute allowedRole="doctor">
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/reviews"
        element={
          <ProtectedRoute allowedRole="doctor">
            <ReviewQueuePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/review/:patientId"
        element={
          <ProtectedRoute allowedRole="doctor">
            <PatientReviewPage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all 404 Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;