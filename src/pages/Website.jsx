import { useMemo, useState } from 'react'
import { Form, Popconfirm, Tabs } from 'antd'
import { BsFillPencilFill } from 'react-icons/bs'
import { RiDeleteBin6Line } from 'react-icons/ri'
import { HolderOutlined } from '@ant-design/icons'
import PageTitleAddbtn from '../utils/PageTitleAddbtn'
import CommanModal from '../utils/CommanModal'
import InputField from '../utils/InputField'
import ButtonUi from '../utils/ButtonUi'
import { DndContext } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { v4 as uuid } from 'uuid'
import { useQuery } from '@tanstack/react-query'
import api from '../config/api'
import apiList from '../config/apiList'

const SortablePolicySection = ({ policy, onEdit, onDelete }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: policy._id })

    return (
        <section
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
                ...(isDragging ? { position: 'relative', zIndex: 1 } : {}),
            }}
            className="rounded-lg border border-gray-200 bg-white p-5"
        >
            <div className="mb-3 flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <button
                        type="button"
                        {...attributes}
                        {...listeners}
                        aria-label={`Reorder ${policy.title}`}
                        className="mt-1 cursor-grab touch-none text-lg text-gray-400 active:cursor-grabbing"
                    >
                        <HolderOutlined />
                    </button>
                    <div>
                        <h3 className="text-lg font-semibold">{policy.title}</h3>
                        <p className="mt-1 text-sm text-gray-600">{policy.subtitle}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => onEdit(policy)}
                        aria-label={`Edit ${policy.title}`}
                        className="flex items-center gap-2 rounded-md border border-primary px-3 py-1.5 text-sm text-primary transition-colors hover:bg-primary hover:text-white"
                    >
                        <BsFillPencilFill />
                        <span>Edit</span>
                    </button>
                    <Popconfirm
                        title="Delete policy section"
                        description={`Are you sure you want to delete "${policy.title}"?`}
                        onConfirm={() => onDelete(policy)}
                    >
                        <button
                            type="button"
                            aria-label={`Delete ${policy.title}`}
                            className="flex items-center gap-2 rounded-md border border-red-500 px-3 py-1.5 text-sm text-red-500 transition-colors hover:bg-red-500 hover:text-white"
                        >
                            <RiDeleteBin6Line />
                            <span>Delete</span>
                        </button>
                    </Popconfirm>
                </div>
            </div>
            {policy.points?.length > 0 && (
                <ul className="list-disc space-y-1 pl-8 text-sm text-gray-700">
                    {policy.points.map((point) => (
                        <li key={point}>{point}</li>
                    ))}
                </ul>
            )}
        </section>
    )
}

const PolicySections = ({ policies, onAdd, onEdit, onDelete, onDragEnd }) => (
    <div className="flex flex-col gap-4 p-5">
        <ButtonUi text='Add New' className='ms-auto' onClick={onAdd} type='button' />
        <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
            <SortableContext items={policies.map((policy) => policy._id)} strategy={verticalListSortingStrategy}>
                {policies.map((policy) => (
                    <SortablePolicySection
                        key={policy._id}
                        policy={policy}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
            </SortableContext>
        </DndContext>
    </div>
)

const Website = () => {

    const { website } = apiList();

    const [packageTabIndex, setPackageTabIndex] = useState('privacy-policy')
    const [form] = Form.useForm()
    const [editingPolicy, setEditingPolicy] = useState(null)
    const [policyGroups, setPolicyGroups] = useState(null)

    const contactDetails = {
        mobile: '+91 9499839239',
        email: 'sellersupport@rrshoper.in',
    }

    const { data: { privacypoliciesPoints = [], termsConditionsPoints = [], refundPolicy = [] } = {} } = useQuery({
        queryKey: ['website-data'],
        queryFn: () => api.get(website.data),
        select: ({ data }) => {
            const response = data.data.result
            return {
                privacypoliciesPoints: response?.privacyPolicy || [],
                termsConditionsPoints: response?.termsCondition || [],
                refundPolicy: response?.refundPolicy || [],
            }
        }
    })


    const initialPoliciesByTab = useMemo(() => {
        const policies = {
            'privacy-policy': privacypoliciesPoints,
            'terms-conditions': termsConditionsPoints,
            'refund-cancellation': refundPolicy,
        }
        return Object.fromEntries(
            Object.entries(policies).map(([tabKey, items]) => [
                tabKey,
                items.map((policy, index) => ({ ...policy, _id: uuid(), index })),
            ])
        )
    }, [refundPolicy, privacypoliciesPoints, termsConditionsPoints])

    const policiesByTab = policyGroups || initialPoliciesByTab

    const handleDragEnd = (tabKey, { active, over }) => {
        if (!over || active.id === over.id) return

        setPolicyGroups((currentGroups) => {
            const groups = currentGroups || initialPoliciesByTab
            const tabPolicies = groups[tabKey]
            const activeIndex = tabPolicies.findIndex((policy) => policy._id === active.id)
            const overIndex = tabPolicies.findIndex((policy) => policy._id === over.id)

            if (activeIndex < 0 || overIndex < 0) return groups

            const reorderedPolicies = arrayMove(tabPolicies, activeIndex, overIndex)
                .map((policy, index) => ({ ...policy, index }))

            return { ...groups, [tabKey]: reorderedPolicies }
        })
    }

    const handleEdit = (tabKey, policy) => {
        const policyIndex = policiesByTab[tabKey].indexOf(policy)
        setEditingPolicy({ tabKey, policyIndex, title: policy.title, isNew: false })
        form.setFieldsValue({
            title: policy.title,
            subtitle: policy.subtitle,
            points: policy.points || [],
        })
    }

    const handleAdd = (tabKey) => {
        form.resetFields()
        setEditingPolicy({ tabKey, policyIndex: null, title: '', isNew: true })
        form.setFieldsValue({ title: '', subtitle: '', points: [''] })
    }

    const handleSave = async () => {
        const values = await form.validateFields()
        const policy = {
            _id: editingPolicy.isNew ? uuid() : policiesByTab[editingPolicy.tabKey][editingPolicy.policyIndex]._id,
            title: values.title.trim(),
            subtitle: values.subtitle.trim(),
            points: (values.points || []).map((point) => point?.trim()).filter(Boolean),
        }
        setPolicyGroups((currentGroups) => {
            const groups = currentGroups || initialPoliciesByTab
            const tabPolicies = [...groups[editingPolicy.tabKey]]
            if (editingPolicy.isNew) {
                tabPolicies.push({ ...policy, index: tabPolicies.length })
            } else {
                tabPolicies[editingPolicy.policyIndex] = {
                    ...tabPolicies[editingPolicy.policyIndex],
                    ...policy,
                }
            }
            return { ...groups, [editingPolicy.tabKey]: tabPolicies }
        })
        setEditingPolicy(null)
        form.resetFields()
    }

    const handleCloseEdit = () => {
        setEditingPolicy(null)
        form.resetFields()
    }

    const handleDelete = (tabKey, policy) => {
        setPolicyGroups((currentGroups) => {
            const groups = currentGroups || initialPoliciesByTab
            return {
                ...groups,
                [tabKey]: groups[tabKey]
                    .filter((item) => item._id !== policy._id)
                    .map((item, index) => ({ ...item, index })),
            }
        })
    }

    return (
        <div className='flex flex-col gap-5'>
            <PageTitleAddbtn title='Website' />
            <div className="bg-white rounded-lg">
                <Tabs
                    activeKey={packageTabIndex}
                    onChange={setPackageTabIndex}
                    items={[
                        {
                            key: 'privacy-policy',
                            label: (
                                <span className={`px-4 py-1.5 text-base font-medium inline-flex items-center rounded-md ${packageTabIndex === 'privacy-policy' ? 'text-primary' : 'text-gray-600'}`}>
                                    Privacy Policy
                                </span>
                            ),
                            children: (
                                <PolicySections
                                    policies={policiesByTab['privacy-policy']}
                                    onAdd={() => handleAdd('privacy-policy')}
                                    onEdit={(policy) => handleEdit('privacy-policy', policy)}
                                    onDelete={(policy) => handleDelete('privacy-policy', policy)}
                                    onDragEnd={(event) => handleDragEnd('privacy-policy', event)}
                                />
                            ),
                        },
                        {
                            key: 'terms-conditions',
                            label: (
                                <span className={`px-4 py-1.5 text-base font-medium inline-flex items-center rounded-md ${packageTabIndex === 'terms-conditions' ? 'text-primary' : 'text-gray-600'}`}>
                                    Terms & Conditions
                                </span>
                            ),
                            children: (
                                <PolicySections
                                    policies={policiesByTab['terms-conditions']}
                                    onAdd={() => handleAdd('terms-conditions')}
                                    onEdit={(policy) => handleEdit('terms-conditions', policy)}
                                    onDelete={(policy) => handleDelete('terms-conditions', policy)}
                                    onDragEnd={(event) => handleDragEnd('terms-conditions', event)}
                                />
                            ),
                        },
                        {
                            key: 'refund-cancellation',
                            label: (
                                <span className={`px-4 py-1.5 text-base font-medium inline-flex items-center rounded-md ${packageTabIndex === 'refund-cancellation' ? 'text-primary' : 'text-gray-600'}`}>
                                    Refund & Cancellation
                                </span>
                            ),
                            children: (
                                <PolicySections
                                    policies={policiesByTab['refund-cancellation']}
                                    onAdd={() => handleAdd('refund-cancellation')}
                                    onEdit={(policy) => handleEdit('refund-cancellation', policy)}
                                    onDelete={(policy) => handleDelete('refund-cancellation', policy)}
                                    onDragEnd={(event) => handleDragEnd('refund-cancellation', event)}
                                />
                            ),
                        },
                    ]}
                />
            </div>
            <CommanModal
                open={!!editingPolicy}
                title={`${editingPolicy?.isNew ? 'Add' : 'Edit'} ${editingPolicy?.title || 'Policy Section'}`}
                onClose={handleCloseEdit}
                onDone={handleSave}
                width={700}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="title"
                        rules={[{ required: true, whitespace: true, message: 'Enter a policy title' }]}
                    >
                        <InputField type="text" label="Title" placeholder="Enter policy title" />
                    </Form.Item>
                    <Form.Item
                        name="subtitle"
                        rules={[{ required: true, whitespace: true, message: 'Enter a policy description' }]}
                    >
                        <InputField type="text" label="Sub Title" placeholder="Enter policy description" />
                    </Form.Item>
                    <Form.List name="points">
                        {(fields, { add, remove }) => (
                            <div className="flex flex-col gap-2">
                                <span className="font-medium">Policy points</span>
                                {fields.map(({ key, name, ...field }) => (
                                    <div key={key} className="flex items-start gap-2">
                                        <Form.Item
                                            {...field}
                                            name={name}
                                            className="mb-0 flex-1"
                                            rules={[{ required: true, whitespace: true, message: 'Enter a policy point or remove the field' }]}
                                        >
                                            <InputField type="text" placeholder="Enter policy point" />
                                        </Form.Item>
                                        <button
                                            type="button"
                                            aria-label={`Remove policy point ${name + 1}`}
                                            onClick={() => remove(name)}
                                            className="mt-2 rounded-md border border-red-500 p-2 text-red-500 transition-colors hover:bg-red-500 hover:text-white"
                                        >
                                            <RiDeleteBin6Line />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => add('')}
                                    className="self-start rounded-md border border-primary px-3 py-1.5 text-sm text-primary transition-colors hover:bg-primary hover:text-white"
                                >
                                    Add point
                                </button>
                            </div>
                        )}
                    </Form.List>
                </Form>
            </CommanModal>
        </div>
    )
}

export default Website
