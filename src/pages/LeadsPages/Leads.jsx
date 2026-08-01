import React, { useMemo } from 'react'
import PageTitleAddbtn from '../../utils/PageTitleAddbtn'
import apiList from '../../config/apiList'
import { userState } from '../../context/UserContext'
import { useNavigate } from 'react-router-dom'

const Leads = () => {

  const { leadTitles } = apiList()
  const { user, hasPermission } = userState()
  // const { showToast } = useToast()
  const navigate = useNavigate();

  const canAdd = useMemo(() => hasPermission('Leads', false, false, 'add'), [user, hasPermission])

  return (
    <div className='flex flex-col gap-5'>
      <PageTitleAddbtn title='Leads' add={canAdd} addClick={() => navigate('/leads/add')} />
    </div>
  )
}

export default Leads
