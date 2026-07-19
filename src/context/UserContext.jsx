import { createContext, useContext, useEffect, useState } from "react";
import { useIsFetching, useIsMutating, useQuery } from "@tanstack/react-query";
import api from "../config/api";
import apiList from "../config/apiList";
import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "../utils/Loader";


const UserContext = createContext();

export const UserProvider = ({ children }) => {

    const { allOptions } = apiList();
    const { pathname, state } = useLocation();
    const navigate = useNavigate();

    const isFetching = useIsFetching();
    const isMutating = useIsMutating();

    const loading = isFetching > 0 || isMutating > 0;

    const [user, setUser] = useState(null);
    const [refresh, setRefresh] = useState(0);
    const [designation, setDesignation] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, [refresh]);

    const logout = async () => {
        setUser(null);
        localStorage.removeItem("user");
    };

    const { data: { data: { data: options = {} } = {} } = {} } = useQuery({
        queryFn: () => api.get(allOptions.get)
    })

    const hasPermission = (module_name, showModal, redirect, forAction) => {
        if (user?.role === "admin") {
            return true;
        }

        const permission = designation?.permissions?.find(
            (p) => p.module_name === module_name
        );

        if (!permission) {
            return <Loader />;
        }

        const action = forAction ? forAction : pathname.split(module_name.toLowerCase())[1]?.split("/")[1];
        const allowed = !!permission.actions?.[action];
        
        if (!allowed && showModal) {
            Swal.fire({
                icon: "warning",
                title: "Access Denied",
                text: `You do not have access to this ${forAction ? 'Action' : 'page'}.`,
                confirmButtonColor: "#3085d6",
                confirmButtonText: "OK",
            }).then(() => {
                if (redirect) {
                    navigate(state?.from || "/dashboard", { replace: true });
                }
            });
        }

        return allowed;
    };

    return (
        <UserContext.Provider value={{ user, setUser, logout, refresh, setRefresh, loading, options, designation, setDesignation, hasPermission }}>
            {children}
        </UserContext.Provider>
    );
}

export const userState = () => useContext(UserContext);