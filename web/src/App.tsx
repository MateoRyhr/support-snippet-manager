import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import VerifyEmail from './pages/VerifyEmail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/verify" element={<VerifyEmail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;