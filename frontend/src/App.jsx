import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="new-project" element={<NewProject />} />
            <Route path="project/:id" element={<ProjectDetails />} />
            <Route path="contract/:id" element={<Contract />} />
            <Route path="invoice/:id" element={<Invoice />} />
          </Route>
        </Routes>
        <ToastContainer position="top-right" />
      </div>
    </Router>
  );
}

export default App;