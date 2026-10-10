import { useMemo, useState } from 'react'
import { Tabs } from 'antd'
import PageTitleAddbtn from '../../utils/PageTitleAddbtn'
import { v4 as uuid } from 'uuid'
import { useMutation, useQuery } from '@tanstack/react-query'
import api from '../../config/api'
import apiList from '../../config/apiList'
import { useToast } from '../../context/ToastContext'
import AllPolicies from './AllPolicies'
import ContactDetails from './ContactDetails'


const Website = () => {

    const { website } = apiList();
    const { showToast } = useToast();

    const [packageTabIndex, setPackageTabIndex] = useState('privacy-policy')

    const { data: { privacypoliciesPoints = [], termsConditionsPoints = [], refundPolicy = [], ...otherData } = {}, refetch } = useQuery({
        queryKey: ['website-data'],
        queryFn: () => api.get(website.data),
        select: ({ data }) => {
            const response = data.data.result
            return {
                privacypoliciesPoints: response?.privacyPolicy || [],
                termsConditionsPoints: response?.termsCondition || [],
                refundPolicy: response?.refundPolicy || [],
                contactDetails: response?.contactDetails || [],
            }
        }
    })

    const { mutate: handleSaveData, isPending: isSaving } = useMutation({
        mutationFn: (payload) => api.post(website.update, { ...otherData, ...payload }),
        onSuccess: async ({ data }) => {
            showToast(data.message || "Website data saved successfully", "success")
            await refetch()
        },
        onError: async (error) => {
            showToast(error?.response?.data?.error?.error_message || "Error saving website data", "error")
            await refetch()
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
                            children: <AllPolicies activeTab={packageTabIndex} initialPoliciesByTab={initialPoliciesByTab} handleSaveData={handleSaveData} />
                        },
                        {
                            key: 'terms-conditions',
                            label: (
                                <span className={`px-4 py-1.5 text-base font-medium inline-flex items-center rounded-md ${packageTabIndex === 'terms-conditions' ? 'text-primary' : 'text-gray-600'}`}>
                                    Terms & Conditions
                                </span>
                            ),
                            children: <AllPolicies activeTab={packageTabIndex} initialPoliciesByTab={initialPoliciesByTab} handleSaveData={handleSaveData} />
                        },
                        {
                            key: 'refund-cancellation',
                            label: (
                                <span className={`px-4 py-1.5 text-base font-medium inline-flex items-center rounded-md ${packageTabIndex === 'refund-cancellation' ? 'text-primary' : 'text-gray-600'}`}>
                                    Refund & Cancellation
                                </span>
                            ),
                            children: <AllPolicies activeTab={packageTabIndex} initialPoliciesByTab={initialPoliciesByTab} handleSaveData={handleSaveData} />
                        },
                        {
                            key: 'contact-details',
                            label: (
                                <span className={`px-4 py-1.5 text-base font-medium inline-flex items-center rounded-md ${packageTabIndex === 'contact-details' ? 'text-primary' : 'text-gray-600'}`}>
                                    Contact Details
                                </span>
                            ),
                            children: <ContactDetails handleSaveData={handleSaveData} isSaving={isSaving} {...otherData} />
                        },
                    ]}
                />
            </div>

        </div>
    )
}

export default Website
