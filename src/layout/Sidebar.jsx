import React, { useCallback } from 'react'
import { NavLink } from 'react-router-dom'
import { MdLogout } from 'react-icons/md';
import { userState } from '../context/UserContext';

const Sidebar = ({ isExpanded, toggleMenu, links }) => {

    const { user, logout } = userState();

    const change = () => {
        if (window.innerWidth <= 999) toggleMenu()
    }

    return (
        <div className="rounded-lg p-2 space-y-3 border border-borderColor bg-background h-full px-2 flex-shrink-0 scroll overflow-y-auto menu">
            {links.map((list, index) => (
                <NavLink
                    to={"/" + list.to}
                    key={index}
                    onClick={change}
                    className={({ isActive }) =>
                        `${isActive || window.location.pathname.startsWith(`/${list.to.split("/")[0]}`) || (list.to === '/dashboard' && window.location.pathname === `/${user?.role}`) ? 'bg-primary font-semibold text-white' : 'hover:bg-primary hover:text-white'} 
                         ${isExpanded ? 'lg:justify-center' : ''} flex flex-row gap-3 rounded-md px-3 py-2 transition duration-300 ease-in-out`
                    }
                >
                    <list.icon className="text-xl" />
                    {!isExpanded && <span className="text-sm font-medium">{list.name}</span>}
                    {isExpanded && <span className="text-sm font-medium lg:hidden">{list.name}</span>}
                </NavLink>
            ))}
            <button onClick={logout} className={`${isExpanded ? 'lg:justify-center' : ''} w-full hover:bg-primary hover:text-white flex flex-row place-items-center gap-3 rounded-md px-3 py-2 transition duration-300 ease-in-out`}>
                <h6 className='text-xl'><MdLogout /></h6>
                {!isExpanded && <span className="text-sm font-medium">Logout</span>}
                {isExpanded && <span className="text-sm font-medium lg:hidden">Logout</span>}
            </button>
        </div>
    )
}

export default Sidebar
