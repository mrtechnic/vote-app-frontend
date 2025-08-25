import "./App.css";
import { useEffect, useState } from "react";
import { Route, Routes, Navigate } from "react-router";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import Dashboard from "./pages/Dashboard/Dashboard";
import Cookies from "js-cookie";
import { Link } from "react-router";
import RoomView from "./components/RoomView";
import { handleLogout } from "./utils/api";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectIfAuth?: boolean; 
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, redirectIfAuth = false }) => {

  const [token, setToken] = useState<string | undefined>(Cookies.get("authToken"));

  useEffect(() => {
    const interval = setInterval(() => {
      setToken(Cookies.get("authToken"));
    }, 500);
    return () => clearInterval(interval);
  }, []);


  

  // Auth route → redirect if logged in
  if (redirectIfAuth && token) {
    console.log('Redirecting authenticated user to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // Protected route → redirect if NOT logged in
  if (!redirectIfAuth && !token) {
    console.log('Redirecting unauthenticated user to login');
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {

 return (
   <div className="min-h-screen bg-gray-50">
     <Routes>
       {/*  Public Room Route */}
       <Route
         path="/room/:roomId"
         element={
           <RoomView
             roomId={window.location.pathname.split("/room/")[1] || ""}
             onBack={() => window.history.back()}
           />
         }
       />

       {/* Auth Routes */}
       <Route
         path="/login"
         element={
           <ProtectedRoute redirectIfAuth>
             <Login />
           </ProtectedRoute>
         }
       />
       <Route path="/register" element={
        <ProtectedRoute redirectIfAuth>
        <Register />
        </ProtectedRoute>} />
       <Route path="/forgot-password" element={
        <ProtectedRoute redirectIfAuth>
          <ForgotPassword />
          </ProtectedRoute>} />

       {/* Dashboard - Protected */}
       <Route
         path="/dashboard"
         element={
           <ProtectedRoute> 
             <>
               <header className="bg-white shadow-sm border-b">
                 <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                   <div className="flex items-center gap-3">
                     <Link to="/">
                       <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                         VoteApp
                       </h1>
                     </Link>
                   </div>
                   <button
                     onClick={handleLogout}
                     className="text-gray-600 hover:text-gray-900"
                   >
                     Logout
                   </button>
                 </div>
               </header>
               <main className="py-8 px-4">
                 <Dashboard />
               </main>
             </>
          </ProtectedRoute> 
           
         }
       />

       {/* Default fallback - redirect to login */}
       <Route
         path="*"
         element={
           <Navigate
             to={"/login"}
           />
         }
       />
     </Routes>
   </div>
 );
}

export default App;
