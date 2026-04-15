import { Routes, Route, Navigate } from 'react-router-dom';
import Envelope from './components/Envelope';
import AdminPage from './components/AdminPage';
import GiftsPublicPage from './components/GiftsPublicPage';
import './App.css';

function App() {
  return (
    <Routes>
      {/* Rotas reconhecidas */}
      <Route path="/" element={<Envelope />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/presentes" element={<GiftsPublicPage />} />

      {/* Catch-all: qualquer rota desconhecida vai para / */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
