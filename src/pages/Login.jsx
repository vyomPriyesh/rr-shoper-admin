import React, { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom';
import InputField from '../utils/InputField';
import { Form } from 'antd';
import { useMutation } from '@tanstack/react-query';
import api from '../config/api';
import apiList from '../config/apiList';
import { useToast } from '../context/ToastContext';
import { userState } from '../context/UserContext';

const Login = () => {

    const { showToast } = useToast();
    const { auth } = apiList()
    const { setRefresh } = userState();

    const [form] = Form.useForm();
    const values = Form.useWatch([], form);

    const { mutate: handleLogin } = useMutation({
        mutationFn: async () => {
            const response = await api.post(auth.login, values);
            return response.data;
        },
        onSuccess: ({ message, data }) => {
            showToast(message, "success");
            setRefresh((prev) => prev + 1);
            localStorage.setItem("user", JSON.stringify({
                ...data.result,
            }));
        },
        onError: ({ response }) => {
            showToast(response?.data?.error?.error_message || "Login failed", "error");
        }
    })

    return (
        <div className='bg-gradient-to-br from-[#FFF8FC] via-[#F7EDF3] to-[#F2E1EA] h-dvh flex justify-center place-items-center px-5 md:px-0'>
            <Form form={form} onFinish={handleLogin} className="bg-white rounded-lg md:p-10 p-6 flex flex-col gap-5 xl:w-1/4 md:w-1/2 w-full">
                <h6 className='text-xl font-medium text-primary'>Login</h6>
                <Form.Item name='mobile'
                    rules={[
                        { required: true, message: "Mobile number is required" },
                        { len: 10, message: "Enter valid 10-digit mobile number" },
                    ]}
                >
                    <InputField
                        type="tel"
                        maxLength={10}
                        placeholder="Enter 10-digit mobile"
                    />
                </Form.Item>
                <Form.Item name='password'
                    rules={[
                        { required: true, message: "Password is required" },
                    ]}
                >
                    <InputField
                        type='password'
                        placeholder="Enter Password"
                    />
                </Form.Item>
                <button type="submit" className='bg-primary rounded-lg py-2 text-white font-medium flex justify-center place-items-center
                    md:text-xl mt-5 [box-shadow:-5px_-5px_9px_rgba(255,255,255,0.45),5px_5px_9px_rgba(94,104,121,0.3)]'>
                    Login
                </button>
            </Form>
        </div>
    )
}

export default Login
