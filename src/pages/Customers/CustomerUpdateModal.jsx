import React from 'react'
import CommanModal from '../../utils/CommanModal'
import { Form } from 'antd'
import InputField from '../../utils/InputField'

const CustomerUpdateModal = ({ isOpenAddModal, handleCustomerAction, onCloseModal, form, title, passwordModal }) => {
    return (
        <CommanModal title={title} open={isOpenAddModal} onDone={handleCustomerAction} onClose={onCloseModal}>
            <Form form={form} className='flex flex-col gap-3'>
                {passwordModal ?
                    <>
                        <Form.Item
                            name='password'
                            rules={[
                                { required: true, message: 'Password is required' },
                                { min: 6, message: 'Password must be at least 6 characters' }
                            ]}
                        >
                            <InputField type='password' placeholder='Enter Password' />
                        </Form.Item>
                        <Form.Item name='cpassword' dependencies={["password"]}
                            rules={[
                                {
                                    required: true,
                                    message: "Confirm password is required",
                                },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue("password") === value) {
                                            return Promise.resolve();
                                        }

                                        return Promise.reject(
                                            new Error("Passwords do not match")
                                        );
                                    },
                                }),
                            ]}
                        >
                            <InputField type='password' placeholder='Confirm Password' />
                        </Form.Item>
                    </>
                    :
                    <>
                        <Form.Item name='name' rules={[{ required: true, message: 'Name is required' }]}>
                            <InputField type='text' placeholder='Enter Name' />
                        </Form.Item>
                        <Form.Item name='email' rules={[
                            { required: true, message: 'Email is required' },
                            { type: 'email', message: 'Enter valid email' }
                        ]}>
                            <InputField type='email' placeholder='Enter Email' />
                        </Form.Item>
                        <Form.Item name='mobile' rules={[
                            { required: true, message: 'Mobile number is required' },
                            { len: 10, message: 'Enter valid 10-digit mobile number' },
                            {
                                pattern: /^[0-9]+$/,
                                message: "Mobile number must contain only digits",
                            },
                        ]}>
                            <InputField type='text' maxLength={10} placeholder='Enter Mobile Number' />
                        </Form.Item>
                        <Form.Item name='gst_number' rules={[{ required: true, message: 'GST Number is required' }]}>
                            <InputField type='text' placeholder='Enter GST Number' />
                        </Form.Item>
                        <Form.Item name='remark'>
                            <InputField type='textarea' placeholder='Enter Remark' />
                        </Form.Item>
                        <Form.Item name='image'>
                            <InputField
                                type='upload'
                            />
                        </Form.Item>
                    </>
                }
            </Form>
        </CommanModal>
    )
}

export default CustomerUpdateModal
