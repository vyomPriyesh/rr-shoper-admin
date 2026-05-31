import { createContext, useContext, useEffect, useState } from "react";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";


const UserContext = createContext();

export const UserProvider = ({ children }) => {

    const isFetching = useIsFetching();
    const isMutating = useIsMutating();

    const loading = isFetching > 0 || isMutating > 0;

    const [user, setUser] = useState(null);
    const [refresh, setRefresh] = useState(0);

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



    return (
        <UserContext.Provider value={{ user, setUser, logout, refresh, setRefresh, loading }}>
            {children}
        </UserContext.Provider>
    );
}

export const userState = () => useContext(UserContext);