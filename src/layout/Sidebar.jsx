import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { MdLogout } from "react-icons/md";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import { userState } from "../context/UserContext";

const Sidebar = ({ isExpanded, toggleMenu, allLinks }) => {
    const { user, designation, logout } = userState();
    const [openGroups, setOpenGroups] = useState({});

    const change = () => {
        if (window.innerWidth <= 999) toggleMenu();
    };

    const toggleGroup = (name) => {
        setOpenGroups((prev) => ({
            ...prev,
            [name]: !prev[name],
        }));
    };

    const isActiveLink = (to) => {
        const currentPath = window.location.pathname;

        const routePath = `/${to}`;

        return (
            currentPath === routePath ||
            currentPath.startsWith(`${routePath}/`) ||
            (to === "dashboard" &&
                currentPath === `/${user?.role}`)
        );
    };

    const isChildActive = (children) => {
        return children.some((child) => isActiveLink(child.to));
    };


    const filterLinksByPermission = (items) => {
        if (user?.role === "admin") return items;

        const permissionModuleNames =
            designation?.permissions?.map((p) => p.module_name) || [];

        return items
            .map((link) => {

                // If parent has children
                if (link.children) {
                    const filteredChildren = filterLinksByPermission(link.children);

                    // Keep parent only if children available
                    if (filteredChildren.length > 0) {
                        return {
                            ...link,
                            children: filteredChildren,
                        };
                    }

                    return null;
                }

                // Normal menu permission check
                if (permissionModuleNames.includes(link.name)) {
                    return link;
                }

                return null;
            })
            .filter(Boolean);
    };

    const links = filterLinksByPermission(allLinks);

    return (
        <div className="rounded-lg p-2 space-y-2 border border-borderColor bg-background h-full overflow-y-auto">

            {links.map((item, index) => {
                // Group
                if (item.children) {
                    const opened = openGroups[item.name];

                    return (
                        <div key={index}>
                            <button
                                onClick={() => toggleGroup(item.name)}
                                className={`
        w-full flex items-center justify-between rounded-md px-3 py-2 transition
        ${isChildActive(item.children) && !opened
                                        ? "bg-primary text-white"
                                        : "hover:bg-primary hover:text-white"
                                    }
    `}
                            >
                                <div className="flex items-center gap-3">
                                    {item.icon && <item.icon className="text-xl" />}

                                    {!isExpanded && (
                                        <span className="text-sm font-medium">
                                            {item.name}
                                        </span>
                                    )}

                                    {isExpanded && (
                                        <span className="text-sm font-medium lg:hidden">
                                            {item.name}
                                        </span>
                                    )}
                                </div>

                                <FiChevronDown
                                    className={`transition-transform duration-300 ${opened ? "rotate-180" : "rotate-0"
                                        }`}
                                />
                            </button>

                            <div
                                className={`transition-all duration-300 ease-in-out overflow-hidden ${opened
                                    ? "max-h-[500px] opacity-100 translate-y-0"
                                    : "max-h-0 opacity-0 -translate-y-2"
                                    }`}
                            >
                                <div className="ml-5 mt-1 space-y-1 border-l pl-3">
                                    {item.children.map((child, i) => (
                                        <NavLink
                                            key={i}
                                            to={`/${child.to}`}
                                            onClick={change}
                                            className={({ isActive }) =>
                                                `${isActive || isActiveLink(child.to)
                                                    ? "bg-primary text-white"
                                                    : "hover:bg-primary hover:text-white"
                                                }
                    flex items-center gap-3 rounded-md px-3 py-2 transition`
                                            }
                                        >
                                            {child.icon && <child.icon className="text-lg" />}

                                            {!isExpanded && (
                                                <span className="text-sm">
                                                    {child.name}
                                                </span>
                                            )}

                                            {isExpanded && (
                                                <span className="text-sm lg:hidden">
                                                    {child.name}
                                                </span>
                                            )}
                                        </NavLink>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                }

                // Normal Link
                return (
                    <NavLink
                        key={index}
                        to={`/${item.to}`}
                        onClick={change}
                        className={({ isActive }) =>
                            `${isActive || isActiveLink(item.to)
                                ? "bg-primary text-white"
                                : "hover:bg-primary hover:text-white"
                            }
                            flex items-center gap-3 rounded-md px-3 py-2 transition`
                        }
                    >
                        <item.icon className="text-xl" />

                        {!isExpanded && (
                            <span className="text-sm font-medium">
                                {item.name}
                            </span>
                        )}

                        {isExpanded && (
                            <span className="text-sm font-medium lg:hidden">
                                {item.name}
                            </span>
                        )}
                    </NavLink>
                );
            })}

            <button
                onClick={logout}
                className="w-full flex items-center gap-3 rounded-md px-3 py-2 hover:bg-primary hover:text-white transition"
            >
                <MdLogout className="text-xl" />

                {!isExpanded && (
                    <span className="text-sm font-medium">Logout</span>
                )}

                {isExpanded && (
                    <span className="text-sm font-medium lg:hidden">
                        Logout
                    </span>
                )}
            </button>
        </div>
    );
};

export default Sidebar;