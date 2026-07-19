import React, { useState } from 'react'
import PageTitleAddbtn from '../utils/PageTitleAddbtn'
import CommanModal from '../utils/CommanModal'
import InputField from '../utils/InputField'
import { Form, Image, Switch } from 'antd'
import { useMutation, useQuery } from '@tanstack/react-query'
import apiList from '../config/apiList'
import api from '../config/api'
import { useToast } from '../context/ToastContext'
import { userState } from '../context/UserContext'
import TableUi from '../utils/TableUi'

const Platforms = () => {

    const { platforms, images } = apiList();
    const { showToast } = useToast();
    const { user } = userState();

    const [isOpenAddModal, setIsOpenAddModal] = useState(false)
    const [form] = Form.useForm();
    const values = Form.useWatch([], form);
    const [pagination, setPagination] = useState({ page: 1, limit: 10 })
    const [editId, setEditId] = useState(null)

    const onCloseModal = () => {
        setIsOpenAddModal(!isOpenAddModal)
        form.resetFields()
    }

    const { data: { data: allPlatforms = [] } = {}, refetch: allPlatformsRefetch, isFetching: isAllPlatformsFetching } = useQuery({
        queryKey: ['all-platforms', pagination],
        queryFn: () => api.post(platforms.all, pagination),
        enabled: !!user,
        select: ({ data }) => data
    })

    const { mutate: handleAddPlatform } = useMutation({
        mutationFn: async () => {
            try {
                await form.validateFields()
                const response = await api.post(editId ? platforms.updatePlatform(editId) : platforms.add, values);
                return response.data;

            } catch (err) {
                console.error(err)
            }
        },
        onSuccess: ({ message, data }) => {
            showToast(message, "success");
            onCloseModal();
            allPlatformsRefetch();
        }
    })


    const { mutate: changeStatus, isPending } = useMutation({
        mutationFn: (id) => {
            setEditId(id)
            return api.get(platforms.statusUpdate(id))
        },
        onSuccess: ({ data }) => {
            showToast(data.message, "success");
            allPlatformsRefetch()
        }
    })

    const { mutate: handleDelete } = useMutation({
        mutationFn: ({ _id }) => api.delete(platforms.deletePlatform(_id)),
        onSuccess: ({ data }) => {
            showToast(data.message, "success");
            allPlatformsRefetch()
        }
    })


    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (_, record) => {
                return (
                    <div className="flex flex-row gap-3 place-items-center">
                        <Image src={images.imgUrl + record?.image?.image} className='!w-20' />
                        <span className='text-lg'>{record?.name}</span>
                    </div>
                )
            },
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (_, record) => <Switch loading={isPending && record?._id == editId} checkedChildren="Active" unCheckedChildren="Unactive" checked={record?.status} onChange={() => changeStatus(record?._id)} size="medium" className='bg-gray-300 [&.ant-switch-checked]:!bg-primary' />
        },
    ];

    const handleEdit = (data) => {
        setEditId(data._id)
        onCloseModal()
        const imagesData = {
            image: data.image.image,
            name: data.image.image,
            status: "done",
            uid: data.image._id,
            url: images.imgUrl + data.image.image
        }
        form.setFieldsValue({
            name: data.name,
            images: imagesData
        })
    }
    return (
        <div className='flex flex-col gap-5'>
            <PageTitleAddbtn title='Platforms' add addClick={onCloseModal} />
            <TableUi
                columns={columns}
                data={allPlatforms?.data}
                pagination={allPlatforms?.pagination}
                action
                callBack
                module_name='Platforms'
                gridLoading={isAllPlatformsFetching}
                editClick={handleEdit}
                deleteClick={handleDelete}
                handlePagination={setPagination}
            />
            <CommanModal title='Add Platform' open={isOpenAddModal} onDone={handleAddPlatform} onClose={() => setIsOpenAddModal(!isOpenAddModal)}>
                <Form form={form}>
                    <Form.Item name='name'
                        rules={[
                            { required: true, message: "Platform Name is required" },
                        ]}
                    >
                        <InputField
                            type="text"
                            placeholder="Enter Platform Name"
                        />
                    </Form.Item>
                    <Form.Item name='images'
                        rules={[
                            { required: true, message: "Platform Image is required" },
                        ]}
                    >
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
