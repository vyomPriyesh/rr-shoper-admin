
const ButtonUi = ({ onClick, text, alterNate, type, className, ...rest }) => {
    return <button type={type} onClick={onClick} className={`${alterNate ? 'text-primary hover:text-white hover:bg-primary' : 'bg-primary text-background  hover:text-primary hover:bg-white'} border-primary px-5 py-1 rounded-lg font-semibold border transition-all duration-300 ${rest.disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`} {...rest}>{text}</button>
}

export default ButtonUi
