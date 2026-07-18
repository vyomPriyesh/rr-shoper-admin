import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Loader from '../utils/Loader';
import { userState } from '../context/UserContext';

const ProtectedRoute = ({ children, allowedRoles }) => {

    const [isInitialized, setIsInitialized] = useState(false);
    const { user, loading } = userState();

    useEffect(() => {
        if (!loading) {
            setIsInitialized(true);
        }
    }, [loading]);

    if (!isInitialized) {
        return <Loader />
    }

    if (!user || !allowedRoles.includes(user?.role)) {
        return <Navigate to="/" replace />;
    }
    if (!user) {
        return <Navigate to="/" replace />;
    }
    return children;
};

export default ProtectedRoute;