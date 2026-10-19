import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './components/common/Toast';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';

import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import AdminLoginPage from './pages/auth/AdminLoginPage';
import NotFoundPage from './pages/common/NotFoundPage';

import ProductsPage from './pages/user/ProductsPage';
import ProductDetailPage from './pages/user/ProductDetailPage';
import CartPage from './pages/user/CartPage';
import CheckoutPage from './pages/user/CheckoutPage';
import OrdersPage from './pages/user/OrdersPage';
import OrderDetailPage from './pages/user/OrderDetailPage';
import WishlistPage from './pages/user/WishlistPage';
import ProfilePage from './pages/user/ProfilePage';
import TrackOrderPage from './pages/user/TrackOrderPage';

import AdminDashboard from './pages/admin/DashboardPage';
import AdminProductsPage from './pages/admin/ProductsPage';
import ProductFormPage from './pages/admin/ProductFormPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import AdminOrdersPage from './pages/admin/OrdersPage';
import AdminOrderDetailPage from './pages/admin/OrderDetailPage';
import CustomersPage from './pages/admin/CustomersPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import SettingsPage from './pages/admin/SettingsPage';

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <ToastProvider>
                  <Routes>
                    {/* Public Routes */}
                    <Route element={<PublicLayout />}>
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/products" element={<ProductsPage />} />
                      <Route path="/products/:id" element={<ProductDetailPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/signup" element={<SignupPage />} />
                      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                      <Route path="/reset-password" element={<ResetPasswordPage />} />

                      {/* Protected User Routes (Order tracking requires login) */}
                      <Route path="/track" element={<ProtectedRoute><TrackOrderPage /></ProtectedRoute>} />
                      <Route path="/track/:id" element={<ProtectedRoute><TrackOrderPage /></ProtectedRoute>} />
                      <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                      <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                      <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                      <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
                      <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
                      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

                      {/* 404 Route */}
                      <Route path="*" element={<NotFoundPage />} />
                    </Route>

                    {/* Dedicated Admin Authentication */}
                    <Route path="/admin/login" element={<AdminLoginPage />} />

                    {/* Admin Protected Routes */}
                    <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                      <Route index element={<AdminDashboard />} />
                      <Route path="products" element={<AdminProductsPage />} />
                      <Route path="products/new" element={<ProductFormPage />} />
                      <Route path="products/:id/edit" element={<ProductFormPage />} />
                      <Route path="categories" element={<CategoriesPage />} />
                      <Route path="orders" element={<AdminOrdersPage />} />
                      <Route path="orders/:id" element={<AdminOrderDetailPage />} />
                      <Route path="customers" element={<CustomersPage />} />
                      <Route path="analytics" element={<AnalyticsPage />} />
                      <Route path="settings" element={<SettingsPage />} />
                    </Route>
                  </Routes>
                </ToastProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
