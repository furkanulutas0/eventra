import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from 'sonner';
import { Navbar } from "./components/Navbar";
import PrivateRoute from "./components/routes/PrivateRoute";
import { ThemeProvider } from "./components/theme-provider.tsx";
import Home from "./Home";
import SignIn from "./pages/auth/SignIn.tsx";
import SignUp from "./pages/auth/SignUp.tsx";
import Dashboard from "./pages/dashboard/Dashboard.tsx";
import EventCreate from "./pages/event/EventCreate.tsx";
import EventShare from "./pages/event/EventShare.tsx";
import EventStatus from "./pages/event/EventStatus.tsx";
import Profile from "./pages/profile/Profile.tsx";
import { store } from "./redux/store.ts";

function App() {
  //const dispatch = useDispatch();

  return (
    <>
    <ThemeProvider>
      <Provider store={store}>
        <BrowserRouter>
        <Navbar />
          <AppRoutes />
        </BrowserRouter>
      </Provider>
      <Toaster richColors />
      </ThemeProvider>
    </>
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
      <Route path="/event/status" element={<EventStatus />} />

      {/* Kullanıcı giriş yapmadan erişemeyeceği alanlar. */}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/event/create-new-event" element={<EventCreate />} />
      </Route>
    </Routes>
  );
}

export default App;
