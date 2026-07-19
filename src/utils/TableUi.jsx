import { Popconfirm, Table } from 'antd'
import React from 'react'
import ButtonUi from './ButtonUi'
import { MdOutlineEdit, MdRemoveRedEye } from 'react-icons/md'
import { RiDeleteBin6Line } from 'react-icons/ri'
import { useLocation, useNavigate } from 'react-router-dom'
import { userState } from '../context/UserContext'

const TableUi = ({ columns, data, action, editClick, viewClick, deleteClick, showSizeChanger, pagination = {}, handlePagination, callBack, gridLoading, module_name, ...rest }) => {

    const { hasPermission } = userState();

    const navigate = useNavigate()
    const { pathname } = useLocation()

    const handleRowAction = (type, click, data) => {
        if (callBack) {
            click(data)
        } else {
            navigate(`${click}/${data._id}`, { state: { from: pathname } })
        }
    }

    const actionColumn = () => {
        return {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            render: (_, record) => <div className="flex flex-row gap-4">
                {(editClick && hasPermission(module_name, false, false, 'edit')) && <ButtonUi onClick={() => handleRowAction('edit', editClick, record)} className='aspect-square !h-10 !w-10 !p-0 flex justify-center items-center text-xl !text-blue-500 !bg-white !border-blue-500 hover:!bg-blue-500 hover:!text-white' text={<MdOutlineEdit />} />}
                {(viewClick && hasPermission(module_name, false, false, 'view')) && <ButtonUi onClick={() => handleRowAction('view', viewClick, record)} className='aspect-square !h-10 !w-10 !p-0 flex justify-center items-center text-xl !text-green-500 !bg-white !border-green-500 hover:!bg-green-500 hover:!text-white' text={<MdRemoveRedEye />} />}
                {(deleteClick && hasPermission(module_name, false, false, 'delete')) &&
                    <Popconfirm title="Delete Platform" description="Are you sure to delete this Platform?" onConfirm={() => deleteClick(record)}>
                        <ButtonUi
                            className='aspect-square !h-10 !w-10 !p-0 flex justify-center items-center text-xl !text-red-500 !bg-white !border-red-500 hover:!bg-red-500 hover:!text-white'
                            text={<RiDeleteBin6Line />}

                        />
                    </Popconfirm>
                }
            </div>
        }
    }

    const handleTableChange = (data) => {
        handlePagination({
            page: data.current,
            limit: data.pageSize
        })
    }

    return <Table
        className='capitalize'
        columns={action ? [...columns, actionColumn()] : columns}
        dataSource={data}
        loading={gridLoading}
        rowKey="_id"
        pagination={pagination?.total > 10 &&
        {
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: showSizeChanger,
            pageSizeOptions: ["5", "10", "20", "50"],
            showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
        }}
        onChange={handleTableChange}
        {...rest}
    />
}

export default TableUi
