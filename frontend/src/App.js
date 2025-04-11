import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TeamWebsite from './TeamWebsite';
import Login from './Login';
import AdminPanel from './AdminPanel';
import FirebaseCheck from './FirebaseCheck';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TeamWebsite />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        <Route path="/firebase-check" element={<FirebaseCheck />} />
      </Routes>
    </Router>
  );
}

export default App;