import React, { useEffect, useMemo, useState, useRef } from 'react'
import PageTitleAddbtn from '../../utils/PageTitleAddbtn'
import apiList from '../../config/apiList'
import { userState } from '../../context/UserContext'
import { useNavigate } from 'react-router-dom'
import api from '../../config/api'
import { useMutation, useQuery } from '@tanstack/react-query'
import ButtonUi from '../../utils/ButtonUi'
import TableUi from '../../utils/TableUi'
import { displayDate } from '../../utils/DateDisplay'

const Leads = () => {

  const { leads, exportFile } = apiList()
  const { user, hasPermission, options } = userState()
  // const { showToast } = useToast()

  const navigate = useNavigate();

  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [selectedStatus, setSelectedStatus] = useState(null)
  const fileInputRef = useRef(null);

  const handleImport = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const payload = useMemo(() => {
    return {
      ...pagination,
      status: selectedStatus
    }
  }, [pagination, selectedStatus])

  const { data: { allLead = [], paginationData = {}, statusCounts = [] } = {}, refetch: allLeadRefetch, isFetching: isLeadFetching } = useQuery({
    queryKey: ['all-lead-forms', payload],
    queryFn: () => api.post(leads.allLeads, payload),
    enabled: !!user && !!selectedStatus,
    select: ({ data }) => {
      return {
        allLead: data.data.data,
        paginationData: data.data.pagination,
        statusCounts: data.data.statusCounts,
      }
    },
  });

  const statusOptions = useMemo(() => {
    return options?.ticketStatuses?.map(list => ({
      ...list,
      counts: statusCounts.find(item => item._id == list.value)?.count || 0
    }))
  }, [statusCounts, options?.ticketStatuses])

  useEffect(() => {
    setSelectedStatus((options?.ticketStatuses?.[0]?.value))
  }, [options?.ticketStatuses])

  const canAdd = useMemo(() => hasPermission('Leads', false, false, 'add'), [user, hasPermission]);

  const Title = () => {
    return (
      <div className="flex flex-row gap-5">
        <span>Leads</span>
        {!statusOptions ?
          <div className="bg-gray-300 rounded-md aspect-square w-40 h-8 flex flex-col items-center justify-center animate-pulse md:space-y-0 md:space-x-8 rtl:space-x-reverse">
          </div>
          :
          <div className="flex flex-row w-fit rounded-md border border-primary overflow-hidden">
            {statusOptions?.map((list, i) => (
              <ButtonUi
                key={i}
                onClick={() => setSelectedStatus(list.value)}
                text={<span className='flex flex-row gap-2 text-nowrap items-center'>{list.label} <span className={`${selectedStatus == list.value ? 'bg-white text-primary' : 'bg-primary text-white'} transition-all duration-300 ease-out rounded-full aspect-square w-5 h-5 flex justify-center items-center text-xs`}>{list.counts}</span></span>}
                className={`${selectedStatus == list.value ? '!bg-primary hover:bg-primary hover:text-white rounded-none' : 'rounded-none !font-medium !bg-transparent text-primary border-white hover:bg-transparent hover:text-primary'} !text-xs md:!text-sm`}
              />
            ))}
          </div>
        }
      </div>
    )
  }

  const inputColumns = useMemo(() => {
    const { values: { input = [] } = {} } = allLead[0] || {}
    return input.slice(0, 3)?.map(list => ({
      title: list.name,
    }))
  }, [allLead])

  const columns = useMemo(() => [
    {
      title: inputColumns?.[0]?.title,
      dataIndex: inputColumns?.[0]?.title,
      key: inputColumns?.[0]?.title,
      render: (_, record) => record?.values?.input?.[0]?.value
    },
    {
      title: inputColumns?.[1]?.title,
      dataIndex: inputColumns?.[1]?.title,
      key: inputColumns?.[1]?.title,
      render: (_, record) => record?.values?.input?.[1]?.value
    },
    {
      title: inputColumns?.[2]?.title,
      dataIndex: inputColumns?.[2]?.title,
      key: inputColumns?.[2]?.title,
      render: (_, record) => record?.values?.input?.[2]?.value
    },
    user?.role === 'admin' && {
      title: 'Created By',
      dataIndex: 'created_by',
      key: 'created_by',
      render: (_, record) => record?.created_by?.name
    },
    {
      title: 'Assign User',
      dataIndex: 'assign_user',
      key: 'assign_user',
      render: (_, record) => record?.assign_user?.name || 'Un Assigned'
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value) => displayDate(value)
    },
  ].filter(list => list.title), [inputColumns])

  const { mutate: handleExport } = useMutation({
    mutationFn: (sample) => {
      return api.post(exportFile("lead"), { sample, lead_form_id: '6a6d789a074fa8b351dfe027', ...payload }, {
        responseType: "blob",
      });
    },

    onSuccess: ({ data, headers }) => {
      const blob = new Blob([data], {
        type:
          headers["content-type"] ||
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      // Get filename from backend
      const contentDisposition = headers["content-disposition"];

      let fileName = "export.xlsx";

      if (contentDisposition) {
        const match = contentDisposition.match(
          /filename="?([^"]+)"?/i
        );

        if (match?.[1]) {
          fileName = match[1];
        }
      }

      link.download = fileName;

      document.body.appendChild(link);
      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    },
  });

  const otherButton = useMemo(() => {
    return [
      {
        type: 'button',
        addText: 'Export',
        className: 'bg-green-500 border-0 hover:!bg-green-500 hover:text-white hover:scale-105',
        onClick: () => handleExport(false)
      },
      {
        type: 'button',
        addText: 'Sample Import',
        className: 'bg- border-0 hover:!bg-green-500 hover:text-white hover:scale-105',
        onClick: () => handleExport(true)
      },
    ]
  }, [])

  return (
    <div className='flex flex-col gap-5'>
      <div className="bg-white p-5 rounded-lg">
        <PageTitleAddbtn title={<Title />} add={canAdd} addClick={() => navigate('/leads/add')} otherButtons={otherButton} />
      </div>
      <div className="bg-white p-5 rounded-lg">
        <TableUi
          columns={columns}
          data={allLead}
          pagination={paginationData}
          handlePagination={setPagination}
          gridLoading={isLeadFetching}
          action
          callBack
          module_name='Leads'
          viewClick={(data) => navigate(`/leads/view/${data?._id}`)}
          editClick={(data) => navigate(`/leads/update/${data?._id}`)}
        // deleteClick={(data) => handleDeleteUser(data._id)}
        />
      </div>
    </div>
  )
}

export default Leads
