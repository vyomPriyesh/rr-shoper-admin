import React, { useEffect, useState } from 'react'
import { FiMenu } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import { userState } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import api from '../config/api';
import apiList from '../config/apiList';
import { useQuery } from '@tanstack/react-query';

const Navbar = ({ toggleMenu }) => {

    const { user, logout, setUser, designation, setDesignation } = userState();
    const { showToast } = useToast();
    const { auth } = apiList()

    const navigate = useNavigate();

    const { data: profileData, error: profileErrorData, isError: profileError } = useQuery({
        queryKey: ["profile", user?.token],
        queryFn: async () => {
            const response = await api.get(auth.profile);

            return response.data.data.result;
        },
        enabled: !!user?.token,
    });

    useEffect(() => {
        if (profileError) {
            if (profileErrorData?.response?.status == 401) {
                showToast(profileErrorData?.response?.data?.error?.error_message?.message, "error")
                logout();
                return
            }
        } else {
            if (profileData) {
                setDesignation(profileData?.designation)
                const newProdileData = {
                    ...user,
                    ...profileData
                }
                setUser(newProdileData)
            }
        }
    }, [profileData, profileError])


    return (
        <>
            <div className="bg-white sticky top-0 z-40 flex items-center justify-between px-4 gap-5 md:px-6 lg:px-10 h-[8vh]">
                <div className="flex place-items-center md:gap-5 gap-3">
                    <button onClick={toggleMenu} className="text-2xl">
                        <FiMenu />
                    </button>
                    <div className="flex flex-col">
                        <Link to={`/dashboard`} className='text-2xl font-semibold capitalize'>{user?.name}</Link>
                        <span className='text-sm text-gray-500 capitalize'>{user?.role == 'admin' ? 'Administrator' : designation?.name}</span>
                    </div>
                </div>
                <div className="flex items-center gap-10">

                </div>
            </div>
        </>
    )
}

export default Navbar
