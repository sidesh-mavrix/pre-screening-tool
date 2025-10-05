import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProjectCreate from './pages/ProjectCreate';
import ProjectDetail from './pages/ProjectDetail';
import EditProject from './pages/EditProject';
import PreviewPage from './pages/PreviewPage';
import SurveyPage from './pages/SurveyPage';
import Templates from './pages/Templates';
import DataExport from './pages/DataExport';
import OEChecker from './pages/OEChecker';

function App() {
  const { token } = useAuth();

  return (
    <ThemeProvider>
      <Router>
      <Routes>
        {/* Public Survey Route */}
        <Route path="/survey/:projectCode" element={<SurveyPage />} />
        
        {/* Protected Routes */}
        {token ? (
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/create" element={<ProjectCreate />} />
                <Route path="/project/:id" element={<ProjectDetail />} />
                <Route path="/edit/:id" element={<EditProject />} />
                <Route path="/preview/:projectCode" element={<PreviewPage />} />
                <Route path="/templates" element={<Templates />} />
                <Route path="/data-export" element={<DataExport />} />
                <Route path="/oe-checker" element={<OEChecker />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Layout>
          } />
        ) : (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        )}
      </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;