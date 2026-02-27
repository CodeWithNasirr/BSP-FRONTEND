// ProtectedRoute.js
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ element: Element, ...rest }) => {
    const isAuthenticated = localStorage.getItem("authToken"); // Check if token exists

    return isAuthenticated ? <Element {...rest} /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
