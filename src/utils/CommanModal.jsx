import { Modal } from 'antd'
import React from 'react'
import ButtonUi from './ButtonUi'

const CommanModal = ({ open, onClose, onDone, title, children, ...rest }) => {
    return (
        <Modal
            open={open}
            closable={{ 'aria-label': 'Custom Close Button' }}
            title={title}
            centered
            onCancel={onClose}
            footer={[
                <div className='flex flex-row gap-3 justify-end'>
                    <ButtonUi type='button' onClick={onClose} text='Cancel' alterNate />
                    <ButtonUi type='submit' onClick={onDone} text='Done' />
                </div>
            ]}
            {...rest}
        >
            <div className="py-3">
                {children}
            </div>
        </Modal>
    )
}

export default CommanModal