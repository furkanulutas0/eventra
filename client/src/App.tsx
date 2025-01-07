import { ThemeProvider } from "@/components/theme-provider";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from 'sonner';
import { Navbar } from "./components/Navbar";
import PrivateRoute from "./components/routes/PrivateRoute";
import Home from "./Home";
import SignIn from "./pages/auth/SignIn.tsx";
import SignUp from "./pages/auth/SignUp.tsx";
import Dashboard from "./pages/dashboard/Dashboard.tsx";
import EventCreate from "./pages/event/EventCreate.tsx";
import EventDetails from "./pages/event/EventDetails";
import EventShare from "./pages/event/EventShare.tsx";
import EventStats from "./pages/event/EventStats.tsx";
import Profile from "./pages/profile/Profile.tsx";
import { store } from "./redux/store.ts";

function App() {
  //const dispatch = useDispatch();

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Provider store={store}>
        <BrowserRouter>
        <Navbar />
          <AppRoutes />
        </BrowserRouter>
      </Provider>
      <Toaster richColors />
    </ThemeProvider>
  );
}

function AppRoutes() {
  //const location = useLocation();

  // useEffect(() => {
  //   if (location.pathname === "/login") {
  //     return;
  //   }
  //   if (location.pathname === "/") {
  //     dispatch(setCurrentUrl("/dashboard"));
  //   } else dispatch(setCurrentUrl(location.pathname + location.search));
  // }, [dispatch, location]);

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/event/share/:eventId" element={<EventShare />} />
      <Route path="/event/stats/:eventId" element={<EventStats />} />

      {/* Kullanıcı giriş yapmadan erişemeyeceği alanlar. */}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/event/create-new-event" element={<EventCreate />} />
        <Route path="/event/details/:eventId" element={<EventDetails />} />
      </Route>
    </Routes>
  );
}

export default App;
