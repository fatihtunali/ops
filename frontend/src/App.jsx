import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@context/AuthContext';
import ProtectedRoute from '@components/common/ProtectedRoute';
import Login from '@pages/auth/Login';
import Dashboard from '@pages/Dashboard';
import BookingsList from '@pages/bookings/BookingsList';
import BookingDetails from '@pages/bookings/BookingDetails';
import CreateBooking from '@pages/bookings/CreateBooking';
import ClientsList from '@pages/clients/ClientsList';
import HotelsList from '@pages/hotels/HotelsList';
import TourSuppliersList from '@pages/tours/TourSuppliersList';
import GuidesList from '@pages/resources/GuidesList';
import VehiclesList from '@pages/resources/VehiclesList';
import ExpensesList from '@pages/expenses/ExpensesList';
import UsersList from '@pages/users/UsersList';
import ClientPayments from '@pages/payments/ClientPayments';
import SupplierPayments from '@pages/payments/SupplierPayments';
import Reports from '@pages/reports/Reports';
import VoucherGenerator from '@pages/vouchers/VoucherGenerator';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Bookings Routes */}
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <BookingsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings/create"
            element={
              <ProtectedRoute>
                <CreateBooking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings/:id"
            element={
              <ProtectedRoute>
                <BookingDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings/:id/edit"
            element={
              <ProtectedRoute>
                <CreateBooking />
              </ProtectedRoute>
            }
          />

          {/* Clients Routes */}
          <Route
            path="/clients"
            element={
              <ProtectedRoute>
                <ClientsList />
              </ProtectedRoute>
            }
          />

          {/* Hotels Routes */}
          <Route
            path="/hotels"
            element={
              <ProtectedRoute>
                <HotelsList />
              </ProtectedRoute>
            }
          />

          {/* Tour Suppliers Routes */}
          <Route
            path="/tour-suppliers"
            element={
              <ProtectedRoute>
                <TourSuppliersList />
              </ProtectedRoute>
            }
          />

          {/* Resources Routes */}
          <Route
            path="/guides"
            element={
              <ProtectedRoute>
                <GuidesList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicles"
            element={
              <ProtectedRoute>
                <VehiclesList />
              </ProtectedRoute>
            }
          />

          {/* Expenses Routes */}
          <Route
            path="/expenses"
            element={
              <ProtectedRoute>
                <ExpensesList />
              </ProtectedRoute>
            }
          />

          {/* Payment Routes */}
          <Route
            path="/client-payments"
            element={
              <ProtectedRoute>
                <ClientPayments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supplier-payments"
            element={
              <ProtectedRoute>
                <SupplierPayments />
              </ProtectedRoute>
            }
          />

          {/* Reports Routes */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />

          {/* Vouchers Routes */}
          <Route
            path="/vouchers"
            element={
              <ProtectedRoute>
                <VoucherGenerator />
              </ProtectedRoute>
            }
          />

          {/* Users Routes (Admin Only) */}
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <UsersList />
              </ProtectedRoute>
            }
          />

          {/* Default redirect to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
