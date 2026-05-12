import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AppLayout from "./components/common/AppLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ClubsPage from "./pages/ClubsPage";
import ClubDetailsPage from "./pages/ClubDetailsPage";
import EventsPage from "./pages/EventsPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import TasksPage from "./pages/TasksPage";
import NotificationsPage from "./pages/NotificationsPage";
import "./App.css";

// Pages are imported eagerly. The total page-chunk footprint is ~30 KB and
// keeping them static avoids a per-route Suspense round-trip in Vite dev,
// which is the single biggest cause of "Loading…" flashes on first paint.
// Re-introduce React.lazy only when the bundle grows past ~500 KB gzipped.

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/clubs" element={<ClubsPage />} />
            <Route path="/clubs/:clubId" element={<ClubDetailsPage />} />
            <Route
              path="/clubs/:clubId/events/:eventId"
              element={<EventDetailsPage />}
            />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <Navigate to="/dashboard" replace />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
