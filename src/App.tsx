import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './containers/LoginPage';
import LandingPage from './containers/LandingPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<LandingPage />} />
      </Routes>
    </Router>
  );
}

export default App;

