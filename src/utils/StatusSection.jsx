import React, { useCallback, useMemo } from 'react'
import { userState } from '../context/UserContext';

const StatusSection = ({ status }) => {

    const { options } = userState()

    const statusObject = useMemo(() => options?.ticketStatuses?.reduce((acc, status) => {
        acc[status.value] = status;
        return acc;
    }, {}), [options?.ticketStatuses])

    const getStatus = useCallback((status) => {
        if (!statusObject) return
        return (
            statusObject[status] || {
                label: status || "Unknown",
                color: "#f3f4f6",
                bgColor: "#f3f4f6",
            }
        );
    }, [statusObject]);

    const statusInfo = useMemo(() => getStatus(status) || {}, [status, getStatus]);


    return (status &&
        <span className='inline-flex items-center gap-1.5 rounded-full px-2.5 py-1
           2xl:text-sm xl:text-xs font-medium' style={{ color: statusInfo?.color, backgroundColor: statusInfo?.bgColor }}>{statusInfo?.label}</span>
    )
}

export default StatusSection
