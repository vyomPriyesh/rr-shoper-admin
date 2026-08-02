import React from 'react'
import ButtonUi from './ButtonUi'

const PageTitleAddbtn = ({ title, add, addClick, addText, className, otherButtons = [], displayStatus, ...rest }) => {
    return (
        <div className="flex justify-between gap-5">
            <h2 className='text-xl font-semibold'>{title}</h2>
            <div className="flex justify-between gap-5">
                {otherButtons?.length > 0 &&
                    otherButtons?.map((list, i) => (
                        <ButtonUi disabled={list.disabled} onClick={list.addClick} type={list.type} text={list.addText || 'Add'} {...list} className={`text-sm !px-4 ${list.className}`} />
                    ))
                }
                {displayStatus && displayStatus}
                {add &&
                    <ButtonUi disabled={rest.disabled} onClick={addClick} type={rest.type} text={addText || 'Add'} {...rest} className='text-sm md:!px-4 !px-3' />
                }
            </div>
        </div>
    )
}

export default PageTitleAddbtn
