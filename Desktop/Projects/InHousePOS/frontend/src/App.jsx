import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import NewProject from './pages/NewProject';
import ProjectDetails from './pages/ProjectDetails';
import Contract from './pages/Contract';
import Invoice from './pages/Invoice';
import ContractList from './pages/ContractList';
import InvoicesList from './pages/InvoicesList';
import Settings from './pages/Settings';
import CreateContract from './pages/CreateContract';
import ViewContract from './pages/ViewContract';
import EditContract from './pages/EditContract';

// Auth
import { AuthProvider } from './context/AuthProvider';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="projects" element={<Projects />} />
              <Route path="new-project" element={<NewProject />} />
              <Route path="project/:id" element={<ProjectDetails />} />
              
              {/* Contracts */}
              <Route path="contracts" element={<ContractList />} />
              <Route path="contracts/new" element={<CreateContract />} />
              <Route path="contracts/new/:projectId" element={<CreateContract />} />
              <Route path="contracts/:id" element={<ViewContract />} />
              <Route path="contracts/:id/edit" element={<EditContract />} />
              
              <Route path="invoices" element={<InvoicesList />} />
              <Route path="invoice/:id" element={<Invoice />} />
              
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ToastContainer position="top-right" />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;