import React, { useMemo, useState, useEffect } from 'react'
import PageTitleAddbtn from '../utils/PageTitleAddbtn'
import CommanModal from '../utils/CommanModal'
import InputField from '../utils/InputField'
import { Form, Image, Switch } from 'antd'
import { HolderOutlined } from '@ant-design/icons'
import { useMutation, useQuery } from '@tanstack/react-query'
import apiList from '../config/apiList'
import api from '../config/api'
import { useToast } from '../context/ToastContext'
import { userState } from '../context/UserContext'
import TableUi from '../utils/TableUi'

// DnD Kit Imports
import { DndContext } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Custom Draggable Row Component
const DraggableRow = ({ children, ...props }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: props['data-row-key'],
    })

    const style = {
        ...props.style,
        transform: CSS.Translate.toString(transform),
        transition,
        ...(isDragging ? { position: 'relative', zIndex: 9999, background: '#fafafa' } : {}),
    }

    // Context passed down to cells if using a drag handle column
    return (
        <tr
            {...props}
            ref={setNodeRef}
            style={style}
            {...attributes}
        >
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child) && child.key === 'sort') {
                    return React.cloneElement(child, {
                        children: (
                            <HolderOutlined
                                ref={setActivatorNodeRef}
                                {...listeners}
                                className="cursor-grab text-gray-400 hover:text-gray-600 text-lg"
                            />
                        ),
                    })
                }
                return child
            })}
        </tr>
    )
}

const Platforms = () => {
    const { platforms, images } = apiList()
    const { showToast } = useToast()
    const { user, hasPermission } = userState()

    const [isOpenAddModal, setIsOpenAddModal] = useState(false)
    const [form] = Form.useForm()
    const values = Form.useWatch([], form)
    const [pagination, setPagination] = useState({ page: 1, limit: 10 })
    const [editId, setEditId] = useState(null)
    const [dataSource, setDataSource] = useState([])

    const canAdd = useMemo(() => hasPermission('Platforms', false, false, 'add'), [user, hasPermission])

    const onCloseModal = () => {
        setIsOpenAddModal(!isOpenAddModal)
        form.resetFields()
        setEditId(null)
    }

    const {
        data: allPlatforms = {},
        refetch: allPlatformsRefetch,
        isFetching: isAllPlatformsFetching
    } = useQuery({
        queryKey: ['all-platforms', pagination],
        queryFn: () => api.post(platforms.all, pagination),
        enabled: !!user,
        select: ({ data }) => {
            const resData = data?.data?.data || []
            const paginationData = data?.data?.pagination || []

            const sortedData = resData.sort((a, b) => {
                const aIndex = a?.index
                const bIndex = b?.index

                if (aIndex == null) return 1
                if (bIndex == null) return -1

                return Number(aIndex) - Number(bIndex)
            })

            return {
                data: sortedData,
                pagination: paginationData
            }
        }
    })

    // Keep local dataSource in sync with fetched query data
    useEffect(() => {
        if (allPlatforms?.data) {
            setDataSource(allPlatforms.data)
        }
    }, [allPlatforms])

    // Mutation to update row order on the backend
    const { mutate: updateOrder } = useMutation({
        mutationFn: (updatedList) => {
            // Replace with your backend reorder endpoint if available
            // e.g., return api.post(platforms.reorder, { items: updatedList })
            return Promise.resolve()
        },
        onSuccess: () => {
            showToast("Order updated successfully", "success")
            allPlatformsRefetch()
        }
    })

    const handleDragEnd = ({ active, over }) => {
        if (active && over && active.id !== over.id) {
            setDataSource((prev) => {
                const activeIndex = prev.findIndex((item) => item._id === active.id)
                const overIndex = prev.findIndex((item) => item._id === over.id)
                const newOrder = arrayMove(prev, activeIndex, overIndex)
                
                // Trigger backend update with reordered list
                updateOrder(newOrder)
                return newOrder
            })
        }
    }

    const { mutate: handleAddPlatform } = useMutation({
        mutationFn: async () => {
            try {
                await form.validateFields()
                const response = await api.post(editId ? platforms.updatePlatform(editId) : platforms.add, values)
                return response.data
            } catch (err) {
                console.error(err)
            }
        },
        onSuccess: ({ message }) => {
            showToast(message, "success")
            onCloseModal()
            allPlatformsRefetch()
        }
    })

    const { mutate: changeStatus, isPending } = useMutation({
        mutationFn: (id) => {
            setEditId(id)
            return api.get(platforms.statusUpdate(id))
        },
        onSuccess: ({ data }) => {
            showToast(data.message, "success")
            allPlatformsRefetch()
        }
    })

    const { mutate: handleDelete } = useMutation({
        mutationFn: ({ _id }) => api.delete(platforms.deletePlatform(_id)),
        onSuccess: ({ data }) => {
            showToast(data.message, "success")
            allPlatformsRefetch()
        }
    })

    const columns = [
        {
            key: 'sort',
            width: 50,
            align: 'center',
            render: () => null, // Rendered dynamically inside DraggableRow handle
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (_, record) => (
                <div className="flex flex-row gap-3 place-items-center">
                    <Image src={images.imgUrl + record?.image?.image} className='!w-20' />
                    <span className='text-lg'>{record?.name}</span>
                </div>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (_, record) => (
                <Switch 
                    loading={isPending && record?._id === editId} 
                    checkedChildren="Active" 
                    unCheckedChildren="Unactive" 
                    checked={record?.status} 
                    onChange={() => changeStatus(record?._id)} 
                    size="medium" 
                    className='bg-gray-300 [&.ant-switch-checked]:!bg-primary' 
                />
            ),
        },
    ]

    const handleEdit = (data) => {
        setEditId(data._id)
        setIsOpenAddModal(true)
        const imagesData = {
            image: data?.image?.image,
            name: data?.image?.image,
            status: "done",
            uid: data?.image?._id,
            url: images.imgUrl + data?.image?.image
        }
        form.setFieldsValue({
            name: data.name,
            images: imagesData
        })
    }

    return (
        <div className='flex flex-col gap-5'>
            <PageTitleAddbtn title='Platforms' add={canAdd} addClick={onCloseModal} />
            
            <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={handleDragEnd}>
                <SortableContext
                    items={dataSource.map((i) => i._id)}
                    strategy={verticalListSortingStrategy}
                >
                    <TableUi
                        columns={columns}
                        data={dataSource}
                        rowKey="_id"
                        components={{
                            body: {
                                row: DraggableRow,
                            },
                        }}
                        pagination={allPlatforms?.pagination}
                        action
                        callBack
                        module_name='Platforms'
                        gridLoading={isAllPlatformsFetching}
                        editClick={handleEdit}
                        deleteClick={handleDelete}
                        handlePagination={setPagination}
                    />
                </SortableContext>
            </DndContext>

            <CommanModal title={editId ? 'Edit Platform' : 'Add Platform'} open={isOpenAddModal} onDone={handleAddPlatform} onClose={onCloseModal}>
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
