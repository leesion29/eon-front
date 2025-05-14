import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const RoleGuard = ({ allowedRoles, children }) => {
  const { userRole } = useSelector((state) => state.auth); // auth로 변경

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/main/unauthorized" replace />;
  }

  return children;
};

export default RoleGuard;
