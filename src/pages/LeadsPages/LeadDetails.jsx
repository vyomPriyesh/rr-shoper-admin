import React, { useCallback, useMemo } from 'react'
import { userState } from '../../context/UserContext'
import apiList from '../../config/apiList'
import { useParams } from 'react-router-dom'
import api from '../../config/api'
import { useQuery } from '@tanstack/react-query'
import PageTitleAddbtn from '../../utils/PageTitleAddbtn'
import LeadDetailscopy from './LeadDetailscopy'
import { FiCalendar, FiCheckCircle, FiMail, FiPhone, FiUser } from 'react-icons/fi'
import { displayDateTime } from '../../utils/DateDisplay'
import ImagesUploadUi from '../../utils/ImagesUploadUi'

const LeadDetails = () => {

    const { leads, images } = apiList()
    const { user, hasPermission, options } = userState()

    const { id } = useParams();

    const { data: leadDetails = {}, isFetching: leadDetailsFetching } = useQuery({
        queryKey: ['lead-details', id],
        queryFn: () => api.get(leads.getLead(id)),
        enabled: !!user && !!id,
        select: ({ data }) => data.data
    });

    const { values, customer, created_by, assign_user, status, createdAt } = useMemo(() => leadDetails, [leadDetails])

    const selectValue = useCallback((list = {}) => {
        const { extraField, value } = list
        if (extraField?.add_mutiple) {
            if (extraField?.add_manully?.value) {
                const dynamicData = options[extraField?.add_manully?.dynamicField]
                let populatedValue = []
                for (const item of value) {
                    const optionValue = dynamicData?.find(row => row?.value == item)
                    populatedValue.push(optionValue?.label)
                }
                return populatedValue
            }
            return value
        } else {
            return value
        }
    }, [options])

    const statusObject = useMemo(() => options?.ticketStatuses?.reduce((acc, status) => {
        acc[status.value] = status;
        return acc;
    }, {}), [options?.ticketStatuses])

    const getStatus = useCallback((status) => {
        if (!statusObject) return
        return (
            statusObject[status] || {
                label: status || "Unknown",
                color: "#f3f4f6",
                bgColor: "#f3f4f6",
            }
        );
    }, [statusObject])

    const statusInfo = useMemo(() => getStatus(status) || {}, [status, getStatus]);

    const allDetails = useMemo(() => {
        return [
            ...(values?.input ?? []),
            ...(values?.select ?? []),
            ...(values?.number ?? []),
            ...(values?.textarea ?? []),
        ];
    }, [values]);

    return (
        <>
            <div className='flex flex-col gap-5'>
                <div className="bg-white p-5 rounded-lg">
                    <PageTitleAddbtn title={'Lead Details'} displayStatus={<StatusSection {...statusInfo} />} />
                </div>
                <div className="rounded-lg flex flex-col gap-5">
                    <div className="flex flex-row gap-5">
                        <SummaryCard
                            label="Lead Status"
                            value={statusInfo.label}
                            icon={<FiCheckCircle size={18} />}
                            iconClass="bg-blue-50 text-blue-600"
                        />
                        <SummaryCard
                            label="Created On"
                            value={displayDateTime(createdAt)}
                            icon={<FiCalendar size={18} />}
                            iconClass="bg-purple-50 text-purple-600"
                        />
                    </div>
                    <div className="flex flex-row gap-5">
                        <div className="w-2/3">
                            <SectionCard
                                title="Lead Details"
                                subtitle="Information collected for this lead"
                            >
                                {allDetails?.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                                        {allDetails?.map((list, i) => (
                                            <LabelValue index={i} key={i} {...list} />
                                        ))}
                                        {values?.upload?.map((item, i) => (
                                            <div className="col-span-2 flex flex-col gap-2" key={i}>
                                                <p className="mb-1.5 2xl:text-sm xl:text-xs font-medium text-gray-500 capitalize">
                                                    {item?.name}
                                                </p>
                                                <ImagesUploadUi
                                                    value={item?.value}
                                                    multiple={Array.isArray(item?.value)}
                                                    readOnly
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState text="No lead details available" />
                                )}
                            </SectionCard>
                        </div>
                        <div className="w-1/3 flex flex-col gap-5">
                            <PersonCard
                                title="Customer"
                                subtitle="Customer associated with this lead"
                                person={customer}
                                fallbackName="Customer"
                            />
                            <PersonCard
                                title="Reporter"
                                subtitle="Person who created this lead"
                                person={created_by}
                                fallbackName="Reporter"
                            />
                            <PersonCard
                                title="Assigned To"
                                subtitle="Current lead owner"
                                person={assign_user}
                                fallbackName="Sales Executive"
                                role="Sales Executive"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

const PersonCard = ({
    title,
    subtitle,
    person,
    fallbackName,
    image,
}) => {
    const isAssigned = !!person;

    const name =
        person?.name ||
        person?.full_name ||
        person?.first_name ||
        fallbackName;

    const email = person?.email;

    const phone =
        person?.phone ||
        person?.mobile ||
        person?.mobile_number;

    return (
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            {/* Header */}
            <div className="border-b border-gray-100 px-5 py-4">
                <h2 className="text-sm font-semibold text-gray-900">
                    {title}
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                    {subtitle}
                </p>
            </div>

            {/* Body */}
            <div className="p-5">
                {!isAssigned ? (
                    /* =========================
                       NOT ASSIGNED
                    ========================== */
                    <div className="flex items-center gap-3">
                        <div
                            className="flex h-10 w-10 shrink-0 items-center
                            justify-center rounded-full bg-gray-100
                            text-gray-400"
                        >
                            <FiUser size={18} />
                        </div>

                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-700">
                                Unassigned
                            </p>

                            <p className="mt-0.5 text-xs text-gray-400">
                                No user has been assigned yet
                            </p>
                        </div>
                    </div>
                ) : (
                    /* =========================
                       PERSON FOUND
                    ========================== */
                    <>
                        <div className="flex items-center gap-3">
                            <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={
                                    image ||
                                    person?.image ||
                                    person?.profile_image ||
                                    `https://ui-avatars.com/api/?background=B06A8D&color=fff&name=${encodeURIComponent(
                                        name
                                    )}`
                                }
                                alt={name}
                            />

                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-gray-900">
                                    {name}
                                </p>

                                {person?.role && (
                                    <p className="mt-0.5 text-xs text-gray-500">
                                        {person.role}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Contact */}
                        {(email || phone) && (
                            <div className="mt-5 space-y-3 border-t border-gray-100 pt-4">
                                {email && (
                                    <div className="flex items-center gap-2.5 text-xs text-gray-600">
                                        <FiMail
                                            size={15}
                                            className="shrink-0 text-gray-400"
                                        />

                                        <span className="truncate">
                                            {email}
                                        </span>
                                    </div>
                                )}

                                {phone && (
                                    <div className="flex items-center gap-2.5 text-xs text-gray-600">
                                        <FiPhone
                                            size={15}
                                            className="shrink-0 text-gray-400"
                                        />

                                        <span>{phone}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
};



const LabelValue = ({ index, name, value }) => {
    const renderValue = (value) => {
        if (Array.isArray(value)) {
            return (
                <div className="flex flex-wrap gap-1.5">
                    {value.map((item, index) => (
                        <span
                            key={index}
                            className="rounded-md bg-gray-100 px-2 py-1
                            2xl:text-sm xl:text-xs font-medium text-gray-700"
                        >
                            {typeof item === "object"
                                ? item?.name || item?.value || "-"
                                : item}
                        </span>
                    ))}
                </div>
            );
        } else {
            return value
        }
    }
    return (
        <div className="min-w-0" key={index}>
            <p className="mb-1.5 2xl:text-sm xl:text-xs font-medium text-gray-500 capitalize">
                {name}
            </p>

            <div className="break-words 2xl:text-sm xl:text-xs font-medium text-gray-900 capitalize">
                {renderValue(value)}
            </div>
        </div>
    )
}

const StatusSection = ({ label, color, bgColor }) => {
    return (label &&
        <span className='inline-flex items-center gap-1.5 rounded-full px-2.5 py-1
           2xl:text-sm xl:text-xs font-medium' style={{ color, backgroundColor: bgColor }}>{label}</span>
    )
}

const SummaryCard = ({
    label,
    value,
    icon,
    iconClass,
}) => {
    return (
        <div
            className="rounded-xl border border-gray-200 bg-white p-4 w-full
            transition hover:border-gray-300"
        >
            <div className="flex items-center gap-3">
                <div
                    className={`flex h-10 w-10 shrink-0 items-center
                    justify-center rounded-lg ${iconClass}`}
                >
                    {icon}
                </div>

                <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500">
                        {label}
                    </p>

                    <p className="mt-0.5 truncate text-sm font-semibold text-gray-900">
                        {value || "-"}
                    </p>
                </div>
            </div>
        </div>
    );
};

const SectionCard = ({
    title,
    subtitle,
    children,
}) => {
    return (
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white w-full h-full">
            {/* Header */}
            <div className="border-b border-gray-100 px-5 py-4">
                <h2 className="text-sm font-semibold text-gray-900">
                    {title}
                </h2>

                {subtitle && (
                    <p className="mt-0.5 text-xs text-gray-500">
                        {subtitle}
                    </p>
                )}
            </div>

            {/* Body */}
            <div className="p-5">
                {children}
            </div>
        </section>
    );
};

const EmptyState = ({ text }) => {
    return (
        <div className="flex min-h-[120px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-400">{text}</p>
        </div>
    );
};

export default LeadDetails
