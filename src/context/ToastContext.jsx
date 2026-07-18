import { createContext, useContext, useRef, useState } from "react";
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaExclamationTriangle, FaTimes } from "react-icons/fa";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const idRef = useRef(0);

    const removeToast = (id) => {
        setToasts((prev) => prev.filter(t => t.id !== id));
    };


    const showToast = (message, type = "success") => {
        const id = ++idRef.current;

        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter(t => t.id !== id));
        }, 5000);
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* Toast Container */}
            <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`
                            flex items-center gap-2
                            px-4 py-3 rounded-lg shadow-lg text-sm text-white
                            animate-slideIn min-w-[240px]
                            ${getToastStyle(t.type)}
                        `}
                    >
                        {getIcon(t.type)}

                        <span className="flex-1">
                            {t.message}
                        </span>
                        <button
                            onClick={() => removeToast(t.id)}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            <FaTimes size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

/* Icons per type */
const getIcon = (type) => {
    switch (type) {
        case "success":
            return <FaCheckCircle className="text-white text-lg" />;
        case "error":
            return <FaTimesCircle className="text-white text-lg" />;
        case "info":
            return <FaInfoCircle className="text-heading text-lg" />;
        case "warning":
            return <FaExclamationTriangle className="text-white text-lg" />;
        default:
            return <FaCheckCircle className="text-white text-lg" />;
    }
};

/* Theme-based styling */
const getToastStyle = (type) => {
    switch (type) {
        case "success":
            return "bg-primary";
        case "error":
            return "bg-red-500";
        case "info":
            return "bg-secondary text-heading";
        case "warning":
            return "bg-primaryDark";
        default:
            return "bg-primary";
    }
};