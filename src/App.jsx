import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import OrderSuccess from './pages/OrderSuccess';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminStats from './pages/admin/AdminStats';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminOrders from './pages/admin/AdminOrders';
import AdminShipping from './pages/admin/AdminShipping';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{
        style: { fontFamily: 'inherit', borderRadius: '8px' },
        duration: 3000
      }} />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<><Header /><Home /><Footer /></>} />
        <Route path="/product/:id" element={<><Header /><ProductDetail /><Footer /></>} />
        <Route path="/order-success" element={<><Header /><OrderSuccess /><Footer /></>} />

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminStats />} />
          <Route path="stats" element={<AdminStats />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/edit/:id" element={<AdminProductForm />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="shipping" element={<AdminShipping />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
