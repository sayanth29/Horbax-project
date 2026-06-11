import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import Login from './pages/login'
import Dashboard from './pages/Dashboard'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import NewOrder from './pages/NewOrder'
import Pending from './pages/Pending'
import History from './pages/History'
import Collection from './pages/Collection'
import Expenses from './pages/Expenses'
import SettingsPage from './pages/Settings'


const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected — wrapped in Layout */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />

        
         <Route path="/new-order" element={          // 👈 add
            <ProtectedRoute>
              <Layout>
                <NewOrder />
              </Layout>
            </ProtectedRoute>
          } />





          <Route path="/pending" element={
  <ProtectedRoute>
    <Layout>
      <Pending />
    </Layout>
  </ProtectedRoute>
} />



<Route path='/History' element ={
  <ProtectedRoute>
    <Layout>
      <History/>
    </Layout>
  </ProtectedRoute>
}></Route>


<Route path='/collection' element ={
  <ProtectedRoute>
   <Layout>
    <Collection/>
   </Layout>
  </ProtectedRoute>
}></Route>



<Route path='/expenses' element={
  <ProtectedRoute>
    <Layout>
      <Expenses/>
    </Layout>
  </ProtectedRoute>
}> 
</Route>

<Route path='/settings' element ={
  <ProtectedRoute>
    <Layout>
      <SettingsPage/>
    </Layout>
  </ProtectedRoute>
}></Route>






          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App