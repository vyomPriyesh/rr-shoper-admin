import React from 'react'
import ButtonUi from './ButtonUi'

const PageTitleAddbtn = ({ title, add, addClick, ...rest }) => {
    return (
        <div className="flex justify-between gap-5">
            <h2 className='text-xl font-semibold'>{title}</h2>
            {add &&
                <ButtonUi text='Add' onClick={addClick} type={rest.type} />
            }
        </div>
    )
}

export default PageTitleAddbtn
