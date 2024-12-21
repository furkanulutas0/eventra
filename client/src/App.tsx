import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import SignIn from "./auth/SignIn";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/routes/PrivateRoute";
import Dashboard from "./dashboard/Dashboard";
import Home from "./Home";
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
      <Route path="/" element={<Home />} />
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
      <Route path="/login" element={<SignIn />} />
    </Routes>
  );
}

export default App;
