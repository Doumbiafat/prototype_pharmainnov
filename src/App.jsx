import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { WorkflowProvider } from './context/WorkflowContext'
import { PreviewProvider } from './components/PreviewModal'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/AppLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Laboratories from './pages/Laboratories'
import CreateLaboratory from './pages/CreateLaboratory'
import LaboratoryDetail from './pages/LaboratoryDetail'
import ActivityLog from './pages/ActivityLog'
import APD from './pages/APD'
import CreateAPD from './pages/CreateAPD'
import APDDetail from './pages/APDDetail'
import InvoiceDetail from './pages/InvoiceDetail'
import FraisMinisteriels from './pages/FraisMinisteriels'
import CreateFrais from './pages/CreateFrais'
import Medicaments from './pages/Medicaments'
import CreateMedicament from './pages/CreateMedicament'
import Comptes from './pages/Comptes'
import Creances from './pages/Creances'
import Alertes from './pages/Alertes'
import Rapports from './pages/Rapports'

export default function App() {
  return (
    <AuthProvider>
      <WorkflowProvider>
        <PreviewProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="laboratoires" element={<Laboratories />} />
                <Route path="laboratoires/nouveau" element={<CreateLaboratory />} />
                <Route path="laboratoires/:id" element={<LaboratoryDetail />} />
                <Route path="medicaments" element={<Medicaments />} />
                <Route path="medicaments/nouveau" element={<CreateMedicament />} />
                <Route path="frais-ministeriels" element={<FraisMinisteriels />} />
                <Route path="frais-ministeriels/nouveau" element={<CreateFrais />} />
                <Route path="apd" element={<APD />} />
                <Route path="apd/nouvelle" element={<CreateAPD />} />
                <Route path="apd/:id" element={<APDDetail />} />
                <Route path="factures/:id" element={<InvoiceDetail />} />
                <Route path="comptes" element={<Comptes />} />
                <Route path="creances" element={<Creances />} />
                <Route path="journal" element={<ActivityLog />} />
                <Route path="alertes" element={<Alertes />} />
                <Route path="rapports" element={<Rapports />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </PreviewProvider>
      </WorkflowProvider>
    </AuthProvider>
  )
}
