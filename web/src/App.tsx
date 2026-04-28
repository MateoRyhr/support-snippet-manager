import { HashRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import VerifyEmail from './pages/VerifyEmail';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/verify" element={<VerifyEmail />} />
      </Routes>
    </HashRouter>
  );
}

export default App;