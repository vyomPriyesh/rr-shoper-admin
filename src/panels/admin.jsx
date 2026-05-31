import React, { useState } from 'react'
import Navbar from '../layout/Navbar'

const Admin = () => {

    const [isExpanded, setIsExpanded] = useState(false);

    const toggleMenu = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div>
            <Navbar toggleMenu={toggleMenu} />
            <div className="flex h-[92vh] overflow-hidden scroll">
                <div
                    className={`fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden transition-all duration-300 ease-out ${isExpanded ? "translate-x-0" : "-translate-x-full"
                        }`}
                    onClick={toggleMenu}
                ></div>
                <div
                    className={` text-black bg-white shadow-md z-50 fixed lg:static flex-shrink-0 scroll overflow-hidden transition-all duration-300 ease-in-out h-full scroll ${isExpanded ? "translate-x-0 w-64 lg:w-20" : "lg:translate-x-0 -translate-x-full w-64 lg:w-1/6"
                        } overflow-y-auto`}
                >
                    {/* <Sidebar
                        isExpanded={isExpanded}
                        toggleMenu={toggleMenu}
                        links={links}
                    /> */}
                </div>
            </div>
        </div>
    )
}

export default Admin
