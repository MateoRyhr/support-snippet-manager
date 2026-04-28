import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import VerifyEmail from './pages/VerifyEmail';

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/verify" element={<VerifyEmail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;