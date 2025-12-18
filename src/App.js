import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import Register from './Pages/Register';
import Login from './Pages/Login';
import Archive from './Pages/Archive';
import Paiement from './Pages/Paiement';
import Site from './Pages/Site';
import RecuForgot from './Pages/RecuForgot';
import Step1Register from './Components/Step1Register';
import Step2Register from './Components/Step2Register';
import Step3Register from './Components/Step3Register';
import Step4Register from './Components/Step4Register';
import CandidateInfo from './Components/CandidateInfo';
import AdminDashboard from './Pages/AdminDashboard';
import StatistiqueContent from './Contents/StatistiqueContent';
import ReportContent from './Contents/ReportContent';
import GrapheContent from './Contents/GrapheContent';
import CandidatComponent from './Components/CandidatComponet';
import ProfileContent from './Components/ProfileContent';
import DepartementComponent from './Components/DepartementComponent';
import FiliereContent from './Components/FiliereContent';
import ExamenCentreComponent from './Components/ExamenCentreComponent';
import CentreDepotContent from './Components/CentreDepotContent';
import SpecialiteComponent from './Components/SpecialiteComponent';
import ConcourComponent from './Components/ConcourComponent';
import AnneContent from './Contents/AnneContent';
import SessionsContent from './Contents/SessionsContent';
function App() {
  return (
    <Router>
      <Routes>
        {/* Routes publiques */}
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

        {/* Dashboard admin avec sidebar */}
        <Route path='/admin/*' element={<AdminDashboard />}>
          {/* Routes enfants du dashboard */}
          <Route path='statistiques' element={<StatistiqueContent />} />
          <Route path='rapport' element={<ReportContent />} />
          <Route path='graphiques' element={<GrapheContent />} />
          <Route path='candidats' element={<CandidatComponent />} />
          <Route path='departements' element={<DepartementComponent />} />
          <Route path='profile' element={<ProfileContent />} />
          <Route path='filieres' element={<FiliereContent />} />
          <Route path='centre-depot' element={<CentreDepotContent />} />
          <Route path='centre-examen' element={<ExamenCentreComponent />} />
          <Route path='specialites' element={<SpecialiteComponent />} />  
          <Route path='concours' element={<ConcourComponent />} />
          <Route path='annees' element={<AnneContent />} />
          <Route path='sessions' element={<SessionsContent />} />
          {/* Tu pourras ajouter d'autres routes enfants ici */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
