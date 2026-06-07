import { Popconfirm, Table } from 'antd'
import React from 'react'
import ButtonUi from './ButtonUi'
import { MdOutlineEdit, MdRemoveRedEye } from 'react-icons/md'
import { RiDeleteBin6Line } from 'react-icons/ri'

const TableUi = ({ columns, data, action, editClick, viewClick, deleteClick, showSizeChanger, pagination = {}, handlePagination, ...rest }) => {

    const actionColumn = () => {
        return {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            render: (_, record) => <div className="flex flex-row gap-4">
                {editClick && <ButtonUi onClick={() => editClick(record)} className='aspect-square !h-10 !w-10 !p-0 flex justify-center items-center text-xl !text-blue-500 !bg-white !border-blue-500 hover:!bg-blue-500 hover:!text-white' text={<MdOutlineEdit />} />}
                {viewClick && <ButtonUi onClick={() => viewClick(record)} className='aspect-square !h-10 !w-10 !p-0 flex justify-center items-center text-xl !text-green-500 !bg-white !border-green-500 hover:!bg-green-500 hover:!text-white' text={<MdRemoveRedEye />} />}
                {deleteClick &&
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
