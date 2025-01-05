import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function PrivateRoute() {
  const { currentUser, expiresAt } = useSelector((state) => state.user);

  if (!currentUser || Date.now() > expiresAt) {
    return <Navigate to="/login" replace={true} />;
  }
  return currentUser ? <Outlet /> : <Navigate to="/login" replace={true} />;
}