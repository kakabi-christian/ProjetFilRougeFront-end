import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import Register from './Pages/Register';
import Login from './Pages/Login';
import Archive from './Pages/Archive';
import Paiement from './Pages/Paiement';
import Site from './Pages/Site';
import ForgotRecu from './Components/ForgotRecu';
import RecuForgot from './Pages/RecuForgot';
import Step1Register from './Components/Step1Register';

import Step2Register from './Components/Step2Register';
import Step3Register from './Components/Step3Register';
import CandidateInfo from './Components/CandidateInfo';
import Step4Register from './Components/Step4Register';
function App() {
  return (
          <Router>
            {/* Vos routes principales */}
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/Archives' element={<Archive />} />
              <Route path='/Paiement' element={<Paiement />} />
              <Route path='/Site' element={<Site />} />
              <Route path='/Register' element={<Register />} />
              <Route path='/Login' element={<Login />} />
              <Route path='/ForgotRecu' element={<RecuForgot />} />
              <Route path='/Step1Register' element={<Step1Register />} />
              <Route path='/Step2Register' element={<Step2Register />} />
              <Route path='/Step3Register' element={<Step3Register />} />
              <Route path='/Step4Register' element={<Step4Register />} />
              <Route path='/CandidateInfo' element={<CandidateInfo />} />

            </Routes>
            
          </Router>
  
  );
}

export default App;
