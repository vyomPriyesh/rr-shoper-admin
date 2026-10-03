import React, { useCallback, useEffect, useMemo, useState } from 'react'
import PageTitleAddbtn from '../../utils/PageTitleAddbtn'
import StatusSection from '../../utils/StatusSection'
import apiList from '../../config/apiList';
import { userState } from '../../context/UserContext';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../../config/api';
import { useParams } from 'react-router-dom';
import UserAvatar from '../../utils/UserAvatar';
import { IoCall, IoShieldCheckmarkSharp, IoStopwatchOutline } from 'react-icons/io5';
import { TfiEmail } from 'react-icons/tfi';
import { PiBuildingOfficeFill } from 'react-icons/pi';
import { SlCalender } from 'react-icons/sl';
import { DDMMMYYYYdisplayDate, displayDate } from '../../utils/DateDisplay';
import { BsBoxFill, BsFillPencilFill } from 'react-icons/bs';
import { useToast } from '../../context/ToastContext';
import { Empty, Form, Skeleton } from 'antd';
import InputField from '../../utils/InputField';
import CustomerUpdateModal from './CustomerUpdateModal';
import { TbReceiptTax } from 'react-icons/tb';
import { IoBagCheck } from "react-icons/io5";
import { FiClock } from "react-icons/fi";
import { MdOutlineCalendarMonth, MdOutlinePayment } from "react-icons/md";
import { FaArrowRightLong } from 'react-icons/fa6';
import { Tabs } from 'antd';
import TableUi from '../../utils/TableUi';
import { FaEye } from 'react-icons/fa';
import PackageDetailsModal from './PackageDetailsModal';
import { getPackageName } from '../../utils/getPackageName';


const CustomerDetails = () => {

    const { customers, images } = apiList();
    const { user, options, setLoading } = userState();
    const { showToast } = useToast();

    const { id } = useParams();
    const [form] = Form.useForm();
    const [isOpenAddModal, setIsOpenAddModal] = useState(false)
    const [packageTabIndex, setPackageTabIndex] = useState('1');
    const [pagination, setPagination] = useState({ page: 1, limit: 5 });
    const [selectedStatus, setSelectedStatus] = useState('COMPLETED')
    const [paymentSearch, setPaymentSearch] = useState('')
    const [debouncedPaymentSearch, setDebouncedPaymentSearch] = useState('')
    const [subscriptionId, setSubscriptionId] = useState(null)

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedPaymentSearch(paymentSearch)
        }, 500)

        return () => clearTimeout(timer)
    }, [paymentSearch])

    const { data = {}, isFetching: customerDetailsFetching } = useQuery({
        queryKey: ['customer-detailes', id],
        queryFn: () => api.get(customers.customerDetailes(id)),
        enabled: !!user && !!id,
        select: ({ data }) => data.data.result
    })

    const payload = useMemo(() => {
        return {
            ...pagination,
            status: selectedStatus,
            search: debouncedPaymentSearch
        }
    }, [pagination, selectedStatus, debouncedPaymentSearch])

    const { data: { data: payments = [], pagination: paginationData = {} } = {}, isFetching: paymentsPending } = useQuery({
        queryKey: ['customer-payments', id, payload],
        queryFn: () => api.post(customers.allPayments(id), payload),
        enabled: !!user && !!id,
        select: ({ data }) => data.data.result
    })

    const { mutate: handleCustomerAction, isPending: customerHandlePending } = useMutation({
        mutationFn: async () => {
            const payload = await form.validateFields();
            payload.image = payload?.image?.uid
            const response = await api.post(customers.updateCustomer(id), payload);
            return response.data;
        },
        onSuccess: ({ message }) => {
            showToast(message, "success");
            onCloseModal();
            allCustomersRefetch();
        },
        onError: (error) => {
            if (error?.errorFields) {
                return;
            }
            showToast(error?.response?.data?.error?.error_message || (editId ? "Error updating customer" : "Error adding customer"), "error");
        }
    })

    const { mutate: handleInvoiceDownload, isPending } = useMutation({
        mutationFn: (data) => api.get(customers.invoice(data?.payment_id, data?.customer_id), { responseType: 'blob' }),
        onSuccess: (response) => {
            const url = window.URL.createObjectURL(response.data);
            const link = document.createElement("a");

            link.href = url;
            link.download = "tax-invoice.pdf";
            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
        },
    });

    const onCloseModal = () => {
        setIsOpenAddModal(false)
        form.resetFields()
    }

    const handleEdit = useCallback(() => {
        setIsOpenAddModal(true)

        form.setFieldsValue({
            name: data.name,
            email: data.email,
            mobile: data.mobile,
            gst_number: data.gst_number,
            image: {
                url: images.imgUrl + data?.image?.image
            },
        })
    }, [data])

    const isLoading = useMemo(() => customerHandlePending || customerDetailsFetching, [customerHandlePending, customerDetailsFetching])

    useEffect(() => {
        if (isPending == undefined || isPending == null) return
        setLoading(isPending)
    }, [isPending])

    const mapPackageDetails = useCallback((data, status) => {
        return data?.filter(list => list.status == status).map((item) => {
            return {
                id: item._id,
                cancelledReason: item.cancelledReason,
                platform: item?.package_id?.platform?.name,
                platformImg: images.imgUrl + item?.package_id?.platform?.image?.image,
                packageName: `${getPackageName(item?.package_id?.name)} Package`,
                Status: <StatusSection status={item?.status} options={options?.packagesStatuses} />,
                startDate: `Purchased : ${DDMMMYYYYdisplayDate(item?.starts_at)}`,
                endDate: item?.expires_at ? `Expires : ${DDMMMYYYYdisplayDate(item?.expires_at)}` : 'One Time',
                amount: item?.payment_id?.amount ? `₹ ${item?.payment_id?.amount}` : '',
            }
        })
    }, [options?.packagesStatuses, images.imgUrl, getPackageName])

    const activePackages = useMemo(() => mapPackageDetails(data?.subscriptions, 'active'), [data?.subscriptions])
    const expiredPackages = useMemo(() => mapPackageDetails(data?.subscriptions, 'expired'), [data?.subscriptions])
    const cancelledPackages = useMemo(() => mapPackageDetails(data?.subscriptions, 'cancelled'), [data?.subscriptions])

    const statictics = useMemo(() => [
        {
            icon: BsBoxFill,
            label: 'Total Packages',
            value: data?.subscriptions?.length,
            bgClass: 'bg-red-500/20',
            textClass: 'text-red-500',
        },
        {
            icon: IoBagCheck,
            label: 'Active Packages',
            value: activePackages?.length,
            bgClass: 'bg-green-500/20',
            textClass: 'text-green-500',
        },
        {
            icon: FiClock,
            label: 'Expired Packages',
            value: expiredPackages?.length,
            bgClass: 'bg-yellow-500/20',
            textClass: 'text-yellow-500',
        },
        {
            icon: MdOutlinePayment,
            label: 'Total Payments',
            value: data?.subscriptions?.reduce((total, subscription) => total + (subscription?.payment_id?.amount || 0), 0),
            bgClass: 'bg-purple-500/20',
            textClass: 'text-purple-500',
        },
    ], [activePackages, expiredPackages, data?.subscriptions])

    const handlePackageTabChange = (key) => {
        setPackageTabIndex(key);
    }

    const handlePaymentTabChange = (key) => {
        setSelectedStatus(key);
    }

    const columns = useMemo(() => [
        {
            title: 'Invoice No.',
            dataIndex: 'invoice_number',
            key: 'invoice_number',
        },
        {
            title: 'Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (_, record) => DDMMMYYYYdisplayDate(record?.createdAt)
        },
        {
            title: 'Package',
            dataIndex: 'package_id',
            key: 'package_id',
            render: (_, record) => getPackageName(record?.package_id?.name)
        },
        {
            title: 'Platform',
            dataIndex: 'platform',
            key: 'platform',
            render: (_, record) => {
                return <div className="flex flex-row gap-3 items-center">
                    <img src={images.imgUrl + record?.package_id?.platform?.image?.image} alt="" className="w-10 h-10 object-contain rounded-lg" />
                    <span className='font-medium'>{record?.package_id?.platform?.name}</span>
                </div>
            }
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
        },
        {
            title: 'Status',
            dataIndex: 'payment_status',
            key: 'payment_status',
            render: (_, record) => <StatusSection status={record?.payment_status} options={options?.paymentStatuses} />
        },
    ], [getPackageName, DDMMMYYYYdisplayDate, images.imgUrl, options?.paymentStatuses])

    const handleViewDetails = (id) => {
        setSubscriptionId(id)
    }

    if (customerDetailsFetching) {
        return <CustomerDetailsSkeleton />
    }

    return (
        <div className='flex flex-col gap-5'>
            <div className="bg-white p-5 rounded-lg">
                <PageTitleAddbtn title={'Customer Details'} displayStatus={<StatusSection status={data?.status} options={options?.userAccountStatuses} />} />
            </div>
            <div className="bg-white p-5 rounded-lg flex md:flex-row flex-col justify-between gap-5">
                <div className="flex flex-row gap-8 items-center">
                    <UserAvatar image={data?.image?.image} name={data?.name} isLoading={isLoading} className='2xl:h-40 2xl:w-40 md:h-24 md:w-24 w-20 h-20 rounded-full object-cover' />
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-row gap-5 items-center">
                            <span className='text-lg font-medium capitalize'>{data?.name}</span>
                            {data?.otp_status == 'verified' && <span className='text-primary text-xl'><IoShieldCheckmarkSharp /></span>}
                        </div>
                        <DetailwithIcon icon={<TfiEmail />} value={data.email} />
                        <DetailwithIcon icon={<IoCall />} value={data.mobile} />
                        <DetailwithIcon icon={<PiBuildingOfficeFill />} value={data.email} />
                        <DetailwithIcon icon={<TbReceiptTax />} value={data.gst_number} />
                        <DetailwithIcon icon={<SlCalender />} value={`Joined on ${displayDate(data?.createdAt)}`} />
                    </div>
                </div>
                <div className="flex flex-row items-start">
                    <button onClick={handleEdit} className='flex flex-row gap-3 items-center px-4 py-2 border-2 text-primary border-primary rounded-lg hover:bg-primary hover:text-white transition-all duration-300 ease-out'>
                        <span><BsFillPencilFill /></span>
                        <span className='font-medium'>Edit Details</span>
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-4 gap-5">
                {statictics?.map((list, i) => (
                    <div key={i} className="bg-white p-5 flex flex-row gap-4 rounded-lg">
                        <span className={`text-3xl ${list.bgClass} ${list.textClass} h-14 w-14 aspect-square flex justify-center items-center rounded-full`}>
                            <list.icon />
                        </span>
                        <div className="flex flex-col">
                            <span className='font-medium'>{list.label}</span>
                            <span className='font-medium text-lg'>{list.value}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="bg-white rounded-lg">
                <Tabs
                    activeKey={packageTabIndex}
                    tabBarExtraContent={
                        <button className='text-primary group flex flex-row items-center gap-3 transition-all duration-300 ease-out me-5'>
                            <span className='font-medium group-hover:underline'>View All</span>
                            <span className='group-hover:translate-x-1 transition-transform duration-300 ease-out'><FaArrowRightLong /></span>
                        </button>}
                    defaultActiveKey="1"
                    items={[
                        {
                            key: '1',
                            label: <span className={`px-4 py-1.5 text-base font-medium inline-flex items-center rounded-md ${packageTabIndex === '1' ? ' text-primary' : 'text-gray-600'}`}>Active Packages</span>,
                            children: <PackagesSection data={activePackages} handleViewDetails={handleViewDetails} />
                        },
                        {
                            key: '2',
                            label: <span className={`px-4 py-1.5 text-base font-medium inline-flex items-center rounded-md ${packageTabIndex === '2' ? ' text-primary' : 'text-gray-600'}`}>Expired Packages</span>,
                            children: <PackagesSection data={expiredPackages} handleViewDetails={handleViewDetails} />
                        },
                        {
                            key: '3',
                            label: <span className={`px-4 py-1.5 text-base font-medium inline-flex items-center rounded-md ${packageTabIndex === '3' ? ' text-primary' : 'text-gray-600'}`}>Cancelled Packages</span>,
                            children: <PackagesSection data={cancelledPackages} handleViewDetails={handleViewDetails} />
                        }
                    ]}
                    onChange={handlePackageTabChange}
                />
            </div>
            <div className="bg-white rounded-lg flex flex-col">
                <Tabs
                    activeKey={selectedStatus}
                    tabBarExtraContent={
                        <div className='me-5'>
                            <InputField
                                className='!w-60'
                                placeholder='Search Here...'
                                value={paymentSearch}
                                onChange={(e) => setPaymentSearch(e.target.value)}
                            />
                        </div>
                    }
                    defaultActiveKey="COMPLETED"
                    items={[
                        {
                            key: 'COMPLETED',
                            label: <span className={`px-4 py-1.5 text-base font-medium inline-flex items-center rounded-md ${selectedStatus === 'COMPLETED' ? ' text-primary' : 'text-gray-600'}`}>Completed Payments</span>,
                        },
                        {
                            key: 'FAILED',
                            label: <span className={`px-4 py-1.5 text-base font-medium inline-flex items-center rounded-md ${selectedStatus === 'FAILED' ? ' text-primary' : 'text-gray-600'}`}>Failed Payments</span>,
                        }
                    ]}
                    onChange={handlePaymentTabChange}
                />
                <TableUi
                    columns={columns}
                    data={payments}
                    pagination={paginationData}
                    handlePagination={setPagination}
                    gridLoading={paymentsPending}
                    action
                    callBack
                    downClick={selectedStatus == 'COMPLETED' ? (data) => handleInvoiceDownload({ payment_id: data?._id, customer_id: data?.customer_id }) : null}
                />

            </div>
            <CustomerUpdateModal
                isOpenAddModal={isOpenAddModal}
                handleCustomerAction={handleCustomerAction}
                onCloseModal={onCloseModal}
                form={form}
                title='Update Custmers'
            />
            <PackageDetailsModal open={!!subscriptionId} subscriptionId={subscriptionId} onClose={() => setSubscriptionId(null)} />
        </div>
    )
}

const PackagesSection = ({ data, handleViewDetails }) => {
    if (!data?.length) {
        return (
            <div className="flex items-center justify-center py-10">
                <Empty description="No data" />
            </div>
        )
    }

    return (
        <div className="grid grid-cols-3 gap-5 ps-5 pb-5">
            {data?.map((item, index) => (<PackageCard key={index} {...item} handleViewDetails={handleViewDetails} />))}
        </div>
    )
}

const CustomerDetailsSkeleton = () => {
    return (
        <div className='flex flex-col gap-5'>
            <div className="bg-white p-5 rounded-lg">
                <Skeleton.Input active size="large" block style={{ width: 220, height: 28 }} />
            </div>

            <div className="bg-white p-5 rounded-lg flex md:flex-row flex-col justify-between gap-5">
                <div className="flex flex-row gap-8 items-center">
                    <Skeleton.Avatar active size={96} shape="circle" />
                    <div className="flex flex-col gap-3">
                        <Skeleton.Input active size="small" style={{ width: 180, height: 22 }} />
                        <Skeleton.Input active size="small" style={{ width: 260, height: 18 }} />
                        <Skeleton.Input active size="small" style={{ width: 220, height: 18 }} />
                        <Skeleton.Input active size="small" style={{ width: 240, height: 18 }} />
                        <Skeleton.Input active size="small" style={{ width: 200, height: 18 }} />
                    </div>
                </div>
                <Skeleton.Button active style={{ width: 150, height: 42 }} />
            </div>

            <div className="grid grid-cols-4 gap-5">
                {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="bg-white p-5 rounded-lg flex flex-row gap-4">
                        <Skeleton.Avatar active size={52} shape="circle" />
                        <div className="flex flex-col gap-2">
                            <Skeleton.Input active size="small" style={{ width: 110, height: 18 }} />
                            <Skeleton.Input active size="small" style={{ width: 70, height: 20 }} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-lg p-5">
                <div className="flex gap-4 pb-5">
                    <Skeleton.Button active style={{ width: 150, height: 32 }} />
                    <Skeleton.Button active style={{ width: 150, height: 32 }} />
                    <Skeleton.Button active style={{ width: 150, height: 32 }} />
                </div>
                <div className="grid grid-cols-3 gap-5">
                    {[1, 2, 3].map((card) => (
                        <div key={card} className="p-4 bg-secondary/10 rounded-lg flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Skeleton.Avatar active size={36} shape="square" />
                                    <Skeleton.Input active size="small" style={{ width: 90, height: 18 }} />
                                </div>
                                <Skeleton.Button active style={{ width: 90, height: 28 }} />
                            </div>
                            <Skeleton.Input active size="small" style={{ width: '100%', height: 24 }} />
                            <Skeleton.Input active size="small" style={{ width: '100%', height: 18 }} />
                            <Skeleton.Input active size="small" style={{ width: '100%', height: 18 }} />
                            <Skeleton.Button active style={{ width: '100%', height: 38 }} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

const PackageCard = ({ platform, platformImg, Status, packageName, startDate, endDate, amount, handleViewDetails, id }) => {
    return (
        <div className="p-4 bg-secondary/10 rounded-lg flex flex-col gap-3">
            <div className="flex flex-row justify-between items-center">
                <div className="flex flex-row gap-3 items-center">
                    <img src={platformImg} alt="" className="w-10 h-10 object-contain rounded-lg" />
                    <span className='font-medium'>{platform}</span>
                </div>
                <span>{Status}</span>
            </div>
            <div className="flex flex-col gap-2">
                <div className="flex flex-row items-center justify-between">
                    <span className='font-medium text-base'>{packageName}</span>
                    <span className='font-medium text-base'>{amount}</span>
                </div>
                <div className="flex flex-row gap-3 items-center text-gray-500">
                    <span className='text-xl'><MdOutlineCalendarMonth /></span>
                    <span className='text-sm'>{startDate}</span>
                </div>
                <div className="flex flex-row gap-3 items-center text-gray-500">
                    <span className='text-xl'><IoStopwatchOutline /></span>
                    <span className='text-sm'>{endDate}</span>
                </div>
            </div>
            <button onClick={() => handleViewDetails(id)} className='flex flex-row gap-3 items-center justify-center px-4 py-2 border text-primary border-primary rounded-lg hover:bg-primary hover:text-white transition-all duration-300 ease-out'>
                <span><FaEye /></span>
                <span className='font-medium'>View Details</span>
            </button>
        </div>
    )
}

const DetailwithIcon = ({ icon, value }) => {
    return (
        <div className="flex flex-row gap-5 items-center">
            <span className='text-xl'>{icon}</span>
            <span className='text-sm capitalize'>{value}</span>
        </div>
    )
}

export default CustomerDetails
