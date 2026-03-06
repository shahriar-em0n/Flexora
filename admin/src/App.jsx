import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AdminAuthProvider, useAdminAuth } from './contexts/AuthContext'
import AdminLayout from './components/layout/AdminLayout'

// Lazy-load pages
const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const OrderList = lazy(() => import('./pages/orders/OrderList'))
const ProductList = lazy(() => import('./pages/products/ProductList'))
const AddProduct = lazy(() => import('./pages/products/AddProduct'))
const CustomerList = lazy(() => import('./pages/customers/CustomerList'))
const CategoryList = lazy(() => import('./pages/categories/CategoryList'))
const CouponList = lazy(() => import('./pages/coupons/CouponList'))
const ReviewList = lazy(() => import('./pages/reviews/ReviewList'))
const Analytics = lazy(() => import('./pages/analytics/Analytics'))
const AdminRole = lazy(() => import('./pages/users/AdminRole'))
const AuditLog = lazy(() => import('./pages/audit-log/AuditLog'))
const Settings = lazy(() => import('./pages/settings/Settings'))
const TransactionList = lazy(() => import('./pages/transactions/TransactionList'))

// ── Route guard ───────────────────────────────────────────
function RequireAuth({ children }) {
  const { isAuth, loading } = useAdminAuth()
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--admin-bg)' }}>
      <div style={{ width: 40, height: 40, border: '4px solid var(--admin-border)', borderTopColor: 'var(--admin-gold)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )
  return isAuth ? children : <Navigate to="/login" replace />
}

function RequirePerm({ can, children }) {
  const { can: hasCan } = useAdminAuth()
  return hasCan(can) ? children : (
    <div style={{ padding: '3rem', textAlign: 'center' }}>
      <h2 style={{ color: 'var(--admin-error)', marginBottom: '0.5rem' }}>Access Denied</h2>
      <p style={{ color: 'var(--admin-muted)' }}>You don't have permission to view this page.</p>
    </div>
  )
}

const Loading = () => (
  <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ width: 32, height: 32, border: '3px solid var(--admin-border)', borderTopColor: 'var(--admin-gold)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
  </div>
)

// ── App ───────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected */}
        <Route element={<RequireAuth><AdminLayout /></RequireAuth>}>
          <Route index element={<Dashboard />} />

          <Route path="orders" element={<RequirePerm can="orders.view"><OrderList /></RequirePerm>} />
          <Route path="products" element={<RequirePerm can="products.view"><ProductList /></RequirePerm>} />
          <Route path="products/add" element={<RequirePerm can="products.view"><AddProduct /></RequirePerm>} />
          <Route path="customers" element={<RequirePerm can="customers.view"><CustomerList /></RequirePerm>} />
          <Route path="categories" element={<RequirePerm can="categories.view"><CategoryList /></RequirePerm>} />
          <Route path="coupons" element={<RequirePerm can="coupons.view"><CouponList /></RequirePerm>} />
          <Route path="reviews" element={<RequirePerm can="reviews.view"><ReviewList /></RequirePerm>} />
          <Route path="analytics" element={<RequirePerm can="analytics.view"><Analytics /></RequirePerm>} />
          <Route path="users" element={<RequirePerm can="users.view"><AdminRole /></RequirePerm>} />
          <Route path="audit-log" element={<RequirePerm can="audit_log.view"><AuditLog /></RequirePerm>} />
          <Route path="settings" element={<RequirePerm can="settings.view"><Settings /></RequirePerm>} />
          <Route path="transactions" element={<TransactionList />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <AdminAuthProvider>
      <BrowserRouter basename="/admin">
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1C2333', color: '#F0F2F5', border: '1px solid #2A3447', fontSize: '0.875rem' },
            success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
    </AdminAuthProvider>
  )
}
