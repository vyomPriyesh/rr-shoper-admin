import React, { useState } from 'react'
import Navbar from '../layout/Navbar'
import Sidebar from '../layout/Sidebar';
import { LuLayoutDashboard } from 'react-icons/lu';
import { GiPlatform } from 'react-icons/gi';
import Platforms from '../pages/Platforms';
import { Route, Routes } from 'react-router-dom';


const Admin = ({ role }) => {

    const [isExpanded, setIsExpanded] = useState(false);

    const toggleMenu = () => {
        setIsExpanded(!isExpanded);
    };

    const links = [
        {
            name: "Dashboards", to: "dashboard", role: role,
            icon: LuLayoutDashboard
        },
        {
            name: 'Platforms', to: 'platforms', role: role,
            icon: GiPlatform
        },
    ]

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
                        <Route path="platforms" element={<Platforms />} />
                        
                    </Routes>
                </div>
            </div>
        </div>
    )
}

export default Admin
