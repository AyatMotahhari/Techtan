import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TeamWebsite from './TeamWebsite';
import Login from './Login';
import AdminPanel from './AdminPanel';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  return (
    <Router basename="/Techtan"> {/* ← Add this line */}
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
      </Routes>
    </Router>
  );
}

export default App;
