import React from 'react'

const ButtonUi = ({ onClick, text, alterNate, type }) => {
    const className = `${alterNate ? 'text-primary hover:text-white hover:bg-primary' : 'bg-primary text-background  hover:text-primary hover:bg-white'} border-primary px-5 py-1 rounded-lg font-semibold border transition-all duration-300`
    return <button type={type} onClick={onClick} className={className}>{text}</button>
}

export default ButtonUi
