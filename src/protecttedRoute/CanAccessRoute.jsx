import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { userState } from '../context/UserContext';
import Loader from '../utils/Loader';
import CommanModal from '../utils/CommanModal';
import Swal from 'sweetalert2';

const CanAccessRoute = ({ module_name }) => {

    const { designation, user } = userState()

    const { pathname, state } = useLocation();

    const [loading, setLoading] = useState(true);
    const [accessDenied, setAccessDenied] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.token) {
            setLoading(false);
        }
    }, [user?.token]);

    if (loading || !designation) {
        return <Loader />;
    }

    const hasAccess = user?.role === "admin" || designation?.permissions?.find((p) => p.module_name === module_name);

    if (user?.role !== "admin") {
        const { actions } = designation?.permissions?.find((p) => p.module_name === module_name);
        const action = pathname.split(module_name.toLowerCase())[1]?.split('/')[1]
        const actionAccess = actions?.[action]

        if (!hasAccess || !actionAccess) {
            Swal.fire({
                icon: 'warning',
                title: 'Access Denied',
                text: 'You do not have access to this page.',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'OK'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    const redirectTo = state?.from || '/dashboard';
                    navigate(redirectTo, { replace: true });
                }
            });
            return null;
        }
    }


    return <Outlet />;
};

export default CanAccessRoute;
