import { Modal } from 'antd'
import React from 'react'
import ButtonUi from './ButtonUi'

const CommanModal = ({ open, onClose, onDone, title, children, footer, styles, ...rest }) => {
    const hasFooter = !!footer || !!onDone;
    const modalFooter = footer ?? (onDone ? [
        <div key='footer-actions' className='flex flex-row gap-3 justify-end'>
            <ButtonUi type='button' onClick={onClose} text='Cancel' alterNate />
            <ButtonUi type='submit' onClick={onDone} text='Done' />
        </div>
    ] : null)

    return (
        <Modal
            open={open}
            closable={{ 'aria-label': 'Custom Close Button' }}
            title={title}
            centered
            onCancel={onClose}
            styles={{
                header: {
                    borderBottom: '1px solid #f0f0f0',
                    padding: '15px',
                    margin: 0,
                },
                body: {
                    padding: 0,
                    padding: '15px',
                },
                ...(hasFooter && {
                    footer: {
                        borderTop: '1px solid #f0f0f0',
                        padding: '15px',
                        margin: 0,
                    }
                })
                , ...styles
            }}
            footer={modalFooter}
            {...rest}
        >
            <div className="py-3">
                {children}
            </div>
        </Modal>
    )
}

export default CommanModal