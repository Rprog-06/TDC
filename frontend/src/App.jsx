import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CustomerDetails from "./pages/CustomerDetails";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



function ProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem("token") === "loggedIn";

  return isLoggedIn ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/:id"
          element={
            <ProtectedRoute>
              <CustomerDetails />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
        <ToastContainer
        position="bottom-right"
        autoClose={4000}
      />
    </BrowserRouter>
  );
}

export default App;
