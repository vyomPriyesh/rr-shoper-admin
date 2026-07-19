import React, { useState } from 'react'
import Navbar from '../layout/Navbar'
import Sidebar from '../layout/Sidebar';
import { LuLayoutDashboard } from 'react-icons/lu';
import { GiPlatform } from 'react-icons/gi';
import Platforms from '../pages/Platforms';
import { Route, Routes } from 'react-router-dom';
import { TbPackages, TbUsersGroup } from "react-icons/tb";
import Packages from '../pages/Packages';
import Users from '../pages/Users';
import { SiCodesignal } from 'react-icons/si';
import Designation from '../pages/DesignationPages/Designation';
import AddUpdateDesignation from '../pages/DesignationPages/AddUpdateDesignation';
import { userState } from '../context/UserContext';
import CanAccessRoute from '../protecttedRoute/CanAccessRoute';

const Admin = ({ role }) => {

    const { designation, user } = userState()
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleMenu = () => {
        setIsExpanded(!isExpanded);
    };

    const allLinks = [
        {
            name: "Dashboards", to: "dashboard", role: role,
            icon: LuLayoutDashboard
        },
        {
            name: 'Platforms', to: 'platforms/view', role: role,
            icon: GiPlatform
        },
        {
            name: 'Packages', to: 'packages/view', role: role,
            icon: TbPackages
        },
        {
            name: 'Users', to: 'users/view', role: role,
            icon: TbUsersGroup
        },
        {
            name: 'Designation', to: 'designation/view', role: role,
            icon: SiCodesignal
        },
    ]

    const links = allLinks.filter(link => {
        if (user?.role === 'admin') return true;
        const permissionModuleNames = designation?.permissions?.map(p => p.module_name) || [];
        return permissionModuleNames.includes(link.name);
    });

    return (
        <div>
            <Navbar toggleMenu={toggleMenu} />
            <div className="flex h-[92vh] overflow-hidden">
                <div
                    className={`fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden transition-all duration-300 ease-out ${isExpanded ? "translate-x-0" : "-translate-x-full"
                        }`}
                    onClick={toggleMenu}
                ></div>
                <div
                    className={`z-50 px-5 pb-5 fixed lg:static overflow-hidden transition-all duration-300 ease-in-out h-full ${isExpanded ? "translate-x-0 w-64 lg:w-28" : "lg:translate-x-0 -translate-x-full w-64 lg:w-1/6"
                        }`}
                >
                    <Sidebar
                        isExpanded={isExpanded}
                        toggleMenu={toggleMenu}
                        links={links}
                    />
                </div>
                <div className="flex-grow overflow-y-auto overflow-hidden p-5 border border-borderColor bg-background rounded-lg mb-5 mr-5">
                    <Routes>
                        <Route element={<CanAccessRoute module_name="Platforms" />}>
                            <Route path="platforms/view" element={<Platforms />} />
                        </Route>
                        <Route element={<CanAccessRoute module_name="Packages" />}>
                            <Route path="packages/view" element={<Packages />} />
                        </Route>
                        <Route element={<CanAccessRoute module_name="Users" />}>
                            <Route path="users/view" element={<Users />} />
                        </Route>
                        <Route element={<CanAccessRoute module_name="Designation" />}>
                            <Route path="designation/view" element={<Designation />} />
                            <Route path="designation/add" element={<AddUpdateDesignation links={links} />} />
                            <Route path="designation/update/:id" element={<AddUpdateDesignation links={links} />} />
                        </Route>
                    </Routes>
                </div>
            </div>
        </div>
    )
}

export default Admin
