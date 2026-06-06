import { Popconfirm, Table } from 'antd'
import React from 'react'
import ButtonUi from './ButtonUi'
import { MdOutlineEdit, MdRemoveRedEye } from 'react-icons/md'
import { RiDeleteBin6Line } from 'react-icons/ri'

const TableUi = ({ columns, data, action, editClick, viewClick, deleteClick }) => {

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

    return <Table className='capitalize' columns={action ? [...columns, actionColumn()] : columns} dataSource={data} />
}

export default TableUi
