// src/App.tsx
import { useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import { onAuthStateChange } from "@/lib/auth";
import Home from "./pages/Home";
import TravelerRegister from "./pages/TravelerRegister";
import DriverRegister from "./pages/DriverRegister";
import Login from "./pages/Login";
import BookingForm from "./pages/BookingForm";
import TravelerDashboard from "./pages/TravelerDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import DriverBids from "./pages/DriverBids";
import NotFound from "./pages/not-found";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [location, setLocation] = useLocation();

  // ←←← THIS IS THE MISSING GLOBAL REDIRECT LOGIC
  useEffect(() => {
    const { unsubscribe } = onAuthStateChange((payload) => {
      if (payload?.profile) {
        const target = payload.profile.user_type === "driver"
          ? "/driver-dashboard"
          : "/traveler-dashboard";

        // If user is logged in and looking at login/register/home → redirect to dashboard
        if (location === "/login" || location === "/register" || location === "/register-driver" || location === "/") {
          setLocation(target);
        }
      }
    });

    return () => unsubscribe();
  }, [location, setLocation]);
  // ←←← END OF FIX

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/register" component={TravelerRegister} />
      <Route path="/register-driver" component={DriverRegister} />
      <Route path="/login" component={Login} />

      <Route path="/book-trip">
        <ProtectedRoute requiredUserType="traveler">
          <BookingForm />
        </ProtectedRoute>
      </Route>

      <Route path="/traveler-dashboard">
        <ProtectedRoute requiredUserType="traveler">
          <TravelerDashboard />
        </ProtectedRoute>
      </Route>

      <Route path="/driver-dashboard">
        <ProtectedRoute requiredUserType="driver">
          <DriverDashboard />
        </ProtectedRoute>
      </Route>

      <Route path="/driver-bids">
        <ProtectedRoute requiredUserType="driver">
          <DriverBids />
        </ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

export default App;