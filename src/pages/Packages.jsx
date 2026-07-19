import React, { useState } from 'react'
import PageTitleAddbtn from '../utils/PageTitleAddbtn'
import apiList from '../config/apiList';
import { useToast } from '../context/ToastContext';
import { userState } from '../context/UserContext';
import { Form, Image, Popover } from 'antd';
import CommanModal from '../utils/CommanModal';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../config/api';
import InputField from '../utils/InputField';
import ButtonUi from '../utils/ButtonUi';
import { LuBadgePlus } from 'react-icons/lu';
import { RiDeleteBin6Line } from 'react-icons/ri';
import TableUi from '../utils/TableUi';
import { BsPatchCheckFill } from 'react-icons/bs';

const Packages = () => {

    const { packages, images } = apiList();
    const { showToast } = useToast();
    const { user, options } = userState();

    const [isOpenAddModal, setIsOpenAddModal] = useState(false)
    const [form] = Form.useForm();
    const values = Form.useWatch([], form);
    const [pagination, setPagination] = useState({ page: 1, limit: 10 })
    const [editId, setEditId] = useState(null)

    const onCloseModal = () => {
        setIsOpenAddModal(!isOpenAddModal)
        form.resetFields()
    }

    const { data: { data: allPlatforms = [] } = {}, refetch: allPackagesRefetch, isFetching: isAllPackagesFetching } = useQuery({
        queryKey: ['all-packages', pagination],
        queryFn: () => api.post(packages.all, pagination),
        enabled: !!user,
        select: ({ data }) => data
    })

    const { mutate: handleAddPlatform } = useMutation({
        mutationFn: async () => {
            try {
                await form.validateFields()
                const response = await api.post(editId ? packages.updatePackage(editId) : packages.add, values);
                return response.data;

            } catch (err) {
                console.error(err)
            }
        },
        onSuccess: ({ message, data }) => {
            showToast(message, "success");
            onCloseModal();
            allPackagesRefetch();
        }
    })

    const { mutate: changeStatus, isPending: statusPending } = useMutation({
        mutationFn: (id) => {
            setEditId(id)
            return api.get(packages.statusUpdate(id))
        },
        onSuccess: ({ data }) => {
            showToast(data.message, "success");
            allPackagesRefetch()
        }
    })

    const { mutate: changePopular, isPending: popularPending } = useMutation({
        mutationFn: (id) => {
            setEditId(id)
            return api.get(packages.updatePopularPackage(id))
        },
        onSuccess: ({ data }) => {
            showToast(data.message, "success");
            allPackagesRefetch()
        },
        onError: ({ response }) => {
            const message = response.data.error.error_message
            showToast(message, "warning");

        }
    })

    const { mutate: handleDelete } = useMutation({
        mutationFn: ({ _id }) => api.delete(packages.deletePackage(_id)),
        onSuccess: ({ data }) => {
            showToast(data.message, "success");
            allPackagesRefetch()
        }
    })

    const handleEdit = (data) => {
        setEditId(data._id)
        onCloseModal()
        form.setFieldsValue({
            platform: data.platform?._id,
            name: data.name,
            price: data.price,
            services: data.services,
        })
    }

    const columns = [
        {
            title: 'Platform',
            dataIndex: 'platform',
            key: 'platform',
            render: (_, record) => {
                return (
                    <div className="flex flex-row gap-3 place-items-center">
                        <Image src={images.imgUrl + record?.platform?.image?.image} className='!w-20' />
                        <span className='text-lg'>{record?.platform?.name}</span>
                    </div>
                )
            },
        },
        {
            title: 'Package Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Services',
            dataIndex: 'services',
            key: 'services',
            render: (text) => <Popover
                content={<div className='flex flex-col gap-3'>
                    {text?.map((list, i) => (
                        <div key={i} className='flex flex-row gap-3 place-items-center'>
                            <BsPatchCheckFill className='text-lg text-primary' />
                            <span className='capitalize text-base'>{list}</span>
                        </div>
                    ))}
                </div>}
                title="Services"
                trigger="click"
            >
                <button type="primary" className='text-blue-400 underline'>Services</button>
            </Popover>
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (_, record) => <InputField type='switch' loading={statusPending && record?._id == editId} checked={record?.status} onChange={() => changeStatus(record?._id)} />
        },
        {
            title: 'Popular',
            dataIndex: 'popular',
            key: 'popular',
            render: (_, record) => <InputField type='switch' loading={popularPending && record?._id == editId} checkedChildren="Popular" unCheckedChildren="Not Popular" checked={record?.popular} onChange={() => changePopular(record?._id)} />
        },
    ];

    return (
        <div className='flex flex-col gap-5'>
            <PageTitleAddbtn title='Packages' add addClick={onCloseModal} />
            <TableUi
                columns={columns}
                data={allPlatforms?.data}
                pagination={allPlatforms?.pagination}
                action
                callBack
                module_name='Packages'
                gridLoading={isAllPackagesFetching}
                editClick={handleEdit}
                deleteClick={handleDelete}
                handlePagination={setPagination}
            />
            <CommanModal title='Add Package' width={1000} open={isOpenAddModal} onDone={handleAddPlatform} onClose={() => setIsOpenAddModal(!isOpenAddModal)}>
                <Form form={form} className='flex flex-col gap-5'>
                    <div className="flex flex-row gap-5">
                        <Form.Item name='platform' className='w-full'
                            rules={[
                                { required: true, message: "Platform is required" },
                            ]}
                        >
                            <InputField
                                type="drop-single-select"
                                options={options?.platforms}
                                placeholder="Select Platform"
                            />
                        </Form.Item>
                        <Form.Item name='name' className='w-full'
                            rules={[
                                { required: true, message: "Packages Name is required" },
                            ]}
                        >
                            <InputField
                                type="text"
                                placeholder="Enter Packages Name"
                            />
                        </Form.Item>
                        <Form.Item name='price' className='w-full'
                            rules={[
                                { required: true, message: "Price is required" },
                            ]}
                        >
                            <InputField
                                type="number"
                                placeholder="Enter Price"
                            />
                        </Form.Item>
                    </div>
                    <Form.List name="services" initialValue={[""]}>
                        {(fields, { add, remove }) => (
                            <>
                                <PageTitleAddbtn title='Services' add addClick={() => add()} type='button' />
                                <div className="flex flex-col gap-3">
                                    {fields.map(({ key, name, ...restField }) => (
                                        <div
                                            key={key}
                                            className="flex items-start gap-3"
                                        >
                                            <Form.Item
                                                {...restField}
                                                name={name}
                                                className="w-full mb-0"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: "Service is required",
                                                    },
                                                ]}
                                            >
                                                <InputField
                                                    type="text"
                                                    placeholder="Enter Service"
                                                />
                                            </Form.Item>
                                            {fields.length > 1 && (
                                                <ButtonUi
                                                    type="button"
                                                    onClick={() => remove(name)}
                                                    className="!text-red-500 !bg-white !border-red-500 hover:!bg-red-500 hover:!text-white aspect-square"
                                                    text={<RiDeleteBin6Line />}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </Form.List>
                </Form>
            </CommanModal>
        </div>
    )
}

export default Packages
