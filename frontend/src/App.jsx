import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// ── Lazy-loaded pages (code splitting for faster initial load) ──
const Home = lazy(() => import('./pages/Home'))
const Shop = lazy(() => import('./pages/Shop'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const UserDashboard = lazy(() => import('./pages/UserDashboard'))
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
// Footer pages
const About = lazy(() => import('./pages/About'))
const Career = lazy(() => import('./pages/Career'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const TermsConditions = lazy(() => import('./pages/TermsConditions'))
const CustomerSupport = lazy(() => import('./pages/CustomerSupport'))
const DeliveryDetails = lazy(() => import('./pages/DeliveryDetails'))
const OrdersFAQ = lazy(() => import('./pages/OrdersFAQ'))
const PaymentsFAQ = lazy(() => import('./pages/PaymentsFAQ'))

// ── Route guard — redirect to /login if not authenticated ──────
function ProtectedRoute({ children }) {
    const { isLoggedIn, loading } = useAuth()
    if (loading) return <div style={{ minHeight: '100vh' }} />
    return isLoggedIn ? children : <Navigate to="/login" replace />
}

// ── Loading fallback ────────────────────────────────────────────
const PageLoader = () => (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '4px solid #eee', borderTopColor: '#000', animation: 'spin 0.8s linear infinite' }} />
    </div>
)

function App() {
    return (
        <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    {/* Main pages */}
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                    <Route path="/order-confirmation" element={<OrderConfirmation />} />

                    {/* Auth pages */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    {/* Protected pages */}
                    <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />

                    {/* Footer — Company */}
                    <Route path="/about" element={<About />} />
                    <Route path="/career" element={<Career />} />

                    {/* Footer — Help */}
                    <Route path="/support" element={<CustomerSupport />} />
                    <Route path="/delivery" element={<DeliveryDetails />} />
                    <Route path="/terms" element={<TermsConditions />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />

                    {/* Footer — FAQ */}
                    <Route path="/faq/orders" element={<OrdersFAQ />} />
                    <Route path="/faq/payments" element={<PaymentsFAQ />} />

                    {/* Catch-all 404 → Home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    )
}

export default App
