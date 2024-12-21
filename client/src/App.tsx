import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import SignIn from "./auth/SignIn";
import SignUp from "./auth/SignUp";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/routes/PrivateRoute";
import Dashboard from "./dashboard/Dashboard";
import EventCreate from "./event/EventCreate.tsx";
import EventShare from "./event/EventShare.tsx";
import EventStatus from "./event/EventStatus.tsx";
import Home from "./Home";
import Profile from "./profile/Profile.tsx";
import { store } from "./redux/store.ts";

function App() {
  //const dispatch = useDispatch();

  return (
    <>
      <Provider store={store}>
        <Navbar />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </Provider>
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
      <Route path="/event/share" element={<EventShare />} />
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
