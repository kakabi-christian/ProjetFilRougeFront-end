import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import Register from './Pages/Register';
import Login from './Pages/Login';
import Archive from './Pages/Archive';
import Paiement from './Pages/Paiement';
import Site from './Pages/Site';


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
            </Routes>
            
          </Router>
  
  );
}

export default App;
