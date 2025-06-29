
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'bootstrap/dist/css/bootstrap.min.css';
import AppNavbar from './components/barraNavegação'; 
import HomePage from './pages/Home';
import ClientsPage from './pages/Clientspage';
import ProdutosPage from './pages/Produtospage';
import ServicosPage from './pages/Servicospage'; 
import PagamentosPage from './pages/Pagamentospage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="bg-light" style={{ minHeight: '100vh' }}>
          
          <AppNavbar />

          <main className="container mt-4">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/produtos" element={<ProdutosPage />} />
              <Route path="/servicos" element={<ServicosPage />} />
              <Route path="/payments" element={<PagamentosPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
