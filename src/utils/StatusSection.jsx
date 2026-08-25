import React from 'react'

const StatusSection = ({ label, color, bgColor }) => {
    return (label &&
        <span className='inline-flex items-center gap-1.5 rounded-full px-2.5 py-1
           2xl:text-sm xl:text-xs font-medium' style={{ color, backgroundColor: bgColor }}>{label}</span>
    )
}

export default StatusSection
