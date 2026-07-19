import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { userState } from '../context/UserContext';
import Loader from '../utils/Loader';
import CommanModal from '../utils/CommanModal';
import Swal from 'sweetalert2';

const CanAccessRoute = ({ module_name }) => {

    const { designation, user, hasPermission } = userState()

    const [loading, setLoading] = useState(true);
    const [accessDenied, setAccessDenied] = useState(false);

    useEffect(() => {
        if (user?.token) {
            setLoading(false);
        }
    }, [user?.token]);

    if (loading || !designation) {
        return <Loader />;
    }
    return hasPermission(module_name, true, true) ? <Outlet /> : null;
};

export default CanAccessRoute;
