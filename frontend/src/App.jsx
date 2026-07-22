import { NavLink, Route, Routes } from 'react-router-dom';
import StudentForm from './components/StudentForm';
import OfficerGate from './components/OfficerGate';

export default function App() {
  return (
    <div className="app">
      <nav className="nav">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
          Student Form
        </NavLink>
        <NavLink to="/officers" className={({ isActive }) => (isActive ? 'active' : '')}>
          Officer Dashboard
        </NavLink>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<StudentForm />} />
          <Route path="/officers" element={<OfficerGate />} />
        </Routes>
      </main>
    </div>
  );
}
