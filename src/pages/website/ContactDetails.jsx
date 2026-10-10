import { Form } from 'antd'
import React, { useEffect } from 'react'
import InputField from '../../utils/InputField'
import ButtonUi from '../../utils/ButtonUi'

const getContactDetailsFormValues = (contactDetails) => ({
    mobile: contactDetails?.mobile || '',
    email: contactDetails?.email || '',
    wamobile: contactDetails?.wamobile || '',
    businessHours: contactDetails?.businessHours || '',
    officeAddress: contactDetails?.officeAddress || '',
})

const ContactDetails = ({ handleSaveData, contactDetails, isSaving }) => {

    const [form] = Form.useForm();

    useEffect(() => {
        form.setFieldsValue(getContactDetailsFormValues(contactDetails))
    }, [contactDetails, form])

    const handleUpdate = async () => {
        const values = await form.validateFields()
        handleSaveData({ contactDetails: values })
    }

    const handleCancel = () => {
        form.resetFields()
        form.setFieldsValue(getContactDetailsFormValues(contactDetails))
    }

    return (
        <div className='px-5 pb-5'>
            <Form form={form} layout="vertical">
                <Form.Item
                    name="mobile"
                    rules={[{ required: true, whitespace: true, message: 'Please Enter Mobile Number' }]}
                >
                    <InputField type="text" label="Mobile" placeholder="Enter Mobile Number" />
                </Form.Item>
                <Form.Item
                    name="wamobile"
                    rules={[{ required: true, whitespace: true, message: 'Please Enter Whatsapp Number' }]}
                >
                    <InputField type="text" label="Whatsapp Number" placeholder="Enter Whatsapp Number" />
                </Form.Item>
                <Form.Item
                    name="email"
                    rules={[{ required: true, whitespace: true, message: 'Please Enter Email' }]}
                >
                    <InputField type="text" label="Email" placeholder="Enter Email" />
                </Form.Item>
                <Form.Item
                    name="businessHours"
                    rules={[{ required: true, whitespace: true, message: 'Please Business Hours' }]}
                >
                    <InputField type="text" label="Business Hours" placeholder="Business Hours" />
                </Form.Item>
                <Form.Item
                    name="officeAddress"
                    rules={[{ required: true, whitespace: true, message: 'Please Office Address' }]}
                >
                    <InputField type="textarea" label="Office Address" placeholder="Office Address" />
                </Form.Item>
            </Form>
            <div className="flex flex-row gap-5 ms-auto w-fit">
                <ButtonUi text='Cancel' className='ms-auto' type='button' alterNate onClick={handleCancel} />
                <ButtonUi text='Update' className='ms-auto' type='button' onClick={handleUpdate} disabled={isSaving} />
            </div>
        </div>
    )
}

export default ContactDetails
