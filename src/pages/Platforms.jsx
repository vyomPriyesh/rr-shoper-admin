import React, { useState } from 'react'
import PageTitleAddbtn from '../utils/PageTitleAddbtn'
import CommanModal from '../utils/CommanModal'
import InputField from '../utils/InputField'
import { Form } from 'antd'
import { useMutation } from '@tanstack/react-query'

const Platforms = () => {

    

    const [isOpenAddModal, setIsOpenAddModal] = useState(false)
    const [form] = Form.useForm();
    const values = Form.useWatch([], form);

    const { mutate: handleAddPlatform } = useMutation({
        mutationFn: async () => {
            // const response = await api.post(auth.login, values);
            // return response.data;
        },
        onSuccess: ({ message, data }) => {
            // showToast(message, "success");
            // setRefresh((prev) => prev + 1);
            // localStorage.setItem("user", JSON.stringify({
            //     ...data.result,
            // }));
        }
    })

    return (
        <div className=''>
            <PageTitleAddbtn title='Platforms' add addClick={() => setIsOpenAddModal(!isOpenAddModal)} />
            <CommanModal title='Add Platform' open={isOpenAddModal} onClose={() => setIsOpenAddModal(!isOpenAddModal)}>
                <Form form={form} onFinish={handleAddPlatform}>
                    <Form.Item name='mobile'
                        rules={[
                            { required: true, message: "Platform Name is required" },
                        ]}
                    >
                        <InputField
                            type="text"
                            placeholder="Enter Platform Name"
                        />
                    </Form.Item>
                    <Form.Item name='images'>
                        <InputField
                            type="upload"
                        />
                    </Form.Item>
                </Form>
            </CommanModal>
        </div>
    )
}

export default Platforms
