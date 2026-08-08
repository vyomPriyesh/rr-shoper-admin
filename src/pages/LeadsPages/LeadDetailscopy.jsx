import React from "react";
import {
    FiArrowLeft,
    FiCalendar,
    FiCheckCircle,
    FiClock,
    FiDownload,
    FiEdit2,
    FiFileText,
    FiMail,
    FiMapPin,
    FiMoreVertical,
    FiPhone,
    FiUser,
} from "react-icons/fi";

const LeadDetailscopy = ({ leadDetails }) => {
    const {
        values = {},
        customer,
        created_by,
        assign_user,
        status = "not_started",
        createdAt,
    } = leadDetails || {};

    // --------------------------------
    // Helpers
    // --------------------------------

    const getValue = (name) => {
        const value = values?.[name];

        if (value === undefined || value === null || value === "") {
            return "-";
        }

        if (Array.isArray(value)) {
            return value.join(", ");
        }

        if (typeof value === "object") {
            return value?.value ?? "-";
        }

        return value;
    };

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getStatus = (status) => {
        const statuses = {
            not_started: {
                label: "Not Started",
                className: "bg-gray-100 text-gray-700",
                dot: "bg-gray-500",
            },

            in_progress: {
                label: "In Progress",
                className: "bg-blue-50 text-blue-700",
                dot: "bg-blue-500",
            },

            completed: {
                label: "Completed",
                className: "bg-emerald-50 text-emerald-700",
                dot: "bg-emerald-500",
            },

            lost: {
                label: "Lost",
                className: "bg-red-50 text-red-700",
                dot: "bg-red-500",
            },

            converted: {
                label: "Converted",
                className: "bg-purple-50 text-purple-700",
                dot: "bg-purple-500",
            },
        };

        return (
            statuses[status] || {
                label: status || "Unknown",
                className: "bg-gray-100 text-gray-700",
                dot: "bg-gray-500",
            }
        );
    };

    const statusInfo = getStatus(status);

    // --------------------------------
    // Dynamic lead fields
    // --------------------------------

    const ignoredFields = [
        "add_mutiple",
        "add_manully",
    ];

    const leadFields = Object.entries(values || {}).filter(([key]) => {
        return (
            !key.includes("_for_manage") &&
            !ignoredFields.some((ignored) => key.includes(ignored))
        );
    });

    // --------------------------------
    // Render
    // --------------------------------

    return (
        <div className="min-h-screen bg-[#f7f8fa]">
            {/* =====================================
                HEADER
            ====================================== */}

            <div className="sticky top-0 z-30 border-b border-gray-200 bg-white">
                <div className="mx-auto max-w-[1500px] px-6 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-4">
                            <button
                                type="button"
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg
                                border border-gray-200 text-gray-600 transition
                                hover:bg-gray-50 hover:text-gray-900"
                            >
                                <FiArrowLeft size={18} />
                            </button>

                            <div className="min-w-0">
                                <div className="mb-1 flex items-center gap-2 text-xs text-gray-500">
                                    <span>Leads</span>
                                    <span>/</span>
                                    <span>Lead Details</span>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="truncate text-xl font-semibold text-gray-900">
                                        {getValue("Business Name") !== "-"
                                            ? getValue("Business Name")
                                            : "Lead Details"}
                                    </h1>

                                    <StatusBadge
                                        statusInfo={statusInfo}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                            <button
                                type="button"
                                className="hidden items-center gap-2 rounded-lg border
                                border-gray-200 bg-white px-3.5 py-2 text-sm
                                font-medium text-gray-700 transition hover:bg-gray-50 sm:flex"
                            >
                                <FiEdit2 size={15} />
                                Edit
                            </button>

                            <button
                                type="button"
                                className="flex h-9 w-9 items-center justify-center
                                rounded-lg border border-gray-200 text-gray-600
                                transition hover:bg-gray-50"
                            >
                                <FiMoreVertical size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* =====================================
                CONTENT
            ====================================== */}

            <main className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 sm:py-6">
                {/* =====================================
                    SUMMARY
                ====================================== */}

                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <SummaryCard
                        label="Lead Status"
                        value={statusInfo.label}
                        icon={<FiCheckCircle size={18} />}
                        iconClass="bg-blue-50 text-blue-600"
                    />

                    <SummaryCard
                        label="Created On"
                        value={formatDate(createdAt)}
                        icon={<FiCalendar size={18} />}
                        iconClass="bg-purple-50 text-purple-600"
                    />

                    <SummaryCard
                        label="Lead Source"
                        value={getValue("Lead Source")}
                        icon={<FiFileText size={18} />}
                        iconClass="bg-orange-50 text-orange-600"
                    />
                </div>

                {/* =====================================
                    MAIN GRID
                ====================================== */}

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                    {/* =================================
                        LEFT COLUMN
                    ================================== */}

                    <div className="min-w-0 space-y-6">
                        {/* Lead Details */}
                        <SectionCard
                            title="Lead Details"
                            subtitle="Information collected for this lead"
                        >
                            {leadFields.length > 0 ? (
                                <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                                    {leadFields.map(([key, value]) => (
                                        <DetailItem
                                            key={key}
                                            label={key}
                                            value={value}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState text="No lead details available" />
                            )}
                        </SectionCard>

                        {/* Documents */}
                        <SectionCard
                            title="Documents"
                            subtitle="Files uploaded with this lead"
                        >
                            <div className="divide-y divide-gray-100">
                                <DocumentRow
                                    name="Business License.png"
                                    size="1.2 MB"
                                />

                                <DocumentRow
                                    name="GST Certificate.pdf"
                                    size="850 KB"
                                />
                            </div>
                        </SectionCard>

                        {/* Activity */}
                        <SectionCard
                            title="Activity"
                            subtitle="Recent activity on this lead"
                        >
                            <div className="space-y-6">
                                <Activity
                                    icon={<FiCheckCircle size={14} />}
                                    title="Lead created"
                                    description="Lead was created by the reporter."
                                    date="Today, 10:30 AM"
                                    color="blue"
                                />

                                <Activity
                                    icon={<FiUser size={14} />}
                                    title="Lead assigned"
                                    description={`Assigned to ${
                                        assign_user?.name || "Sales User"
                                    }`}
                                    date="Today, 10:45 AM"
                                    color="purple"
                                />

                                <Activity
                                    icon={<FiClock size={14} />}
                                    title="Status updated"
                                    description={`Status changed to ${statusInfo.label}`}
                                    date="Today, 11:00 AM"
                                    color="green"
                                    last
                                />
                            </div>
                        </SectionCard>
                    </div>

                    {/* =================================
                        RIGHT COLUMN
                    ================================== */}

                    <div className="space-y-6">
                        {/* Customer */}
                        <PersonCard
                            title="Customer"
                            subtitle="Customer associated with this lead"
                            person={customer}
                            fallbackName="Customer"
                            role="Customer"
                        />

                        {/* Reporter */}
                        <PersonCard
                            title="Reporter"
                            subtitle="Person who created this lead"
                            person={created_by}
                            fallbackName="Reporter"
                            role="Administrator"
                        />

                        {/* Assigned User */}
                        <PersonCard
                            title="Assigned To"
                            subtitle="Current lead owner"
                            person={assign_user}
                            fallbackName="Sales Executive"
                            role="Sales Executive"
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

/* =====================================================
   STATUS BADGE
===================================================== */

const StatusBadge = ({ statusInfo }) => {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1
            text-xs font-medium ${statusInfo.className}`}
        >
            <span
                className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`}
            />

            {statusInfo.label}
        </span>
    );
};

/* =====================================================
   SUMMARY CARD
===================================================== */

const SummaryCard = ({
    label,
    value,
    icon,
    iconClass,
}) => {
    return (
        <div
            className="rounded-xl border border-gray-200 bg-white p-4
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

/* =====================================================
   SECTION CARD
===================================================== */

const SectionCard = ({
    title,
    subtitle,
    children,
}) => {
    return (
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
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

/* =====================================================
   DETAIL ITEM
===================================================== */

const DetailItem = ({ label, value }) => {
    const renderValue = () => {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "-";
        }

        if (Array.isArray(value)) {
            return (
                <div className="flex flex-wrap gap-1.5">
                    {value.map((item, index) => (
                        <span
                            key={index}
                            className="rounded-md bg-gray-100 px-2 py-1
                            text-xs font-medium text-gray-700"
                        >
                            {typeof item === "object"
                                ? item?.name || item?.value || "-"
                                : item}
                        </span>
                    ))}
                </div>
            );
        }

        if (typeof value === "object") {
            return value?.value || value?.name || "-";
        }

        return value;
    };

    return (
        <div className="min-w-0">
            <p className="mb-1.5 text-xs font-medium text-gray-500">
                {label}
            </p>

            <div className="break-words text-sm font-medium text-gray-900">
                {renderValue()}
            </div>
        </div>
    );
};

/* =====================================================
   PERSON CARD
===================================================== */

const PersonCard = ({
    title,
    subtitle,
    person,
    fallbackName,
    role,
}) => {
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

    const address =
        person?.address ||
        person?.location;

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
                {/* Person */}
                <div className="flex items-center gap-3">
                    <div
                        className="flex h-11 w-11 shrink-0 items-center
                        justify-center rounded-full bg-blue-50
                        text-sm font-semibold text-blue-600"
                    >
                        {name?.charAt(0)?.toUpperCase()}
                    </div>

                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                            {name}
                        </p>

                        <p className="mt-0.5 text-xs text-gray-500">
                            {person?.role || role}
                        </p>
                    </div>
                </div>

                {/* Contact */}
                {(email || phone || address) && (
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

                        {address && (
                            <div className="flex items-start gap-2.5 text-xs text-gray-600">
                                <FiMapPin
                                    size={15}
                                    className="mt-0.5 shrink-0 text-gray-400"
                                />

                                <span>{address}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Action */}
                <button
                    type="button"
                    className="mt-5 w-full rounded-lg border border-gray-200
                    px-3 py-2 text-xs font-medium text-gray-700
                    transition hover:bg-gray-50"
                >
                    View Details
                </button>
            </div>
        </section>
    );
};

/* =====================================================
   DOCUMENT ROW
===================================================== */

const DocumentRow = ({
    name,
    size,
}) => {
    return (
        <div className="flex items-center justify-between gap-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
                <div
                    className="flex h-9 w-9 shrink-0 items-center
                    justify-center rounded-lg bg-gray-50 text-gray-500"
                >
                    <FiFileText size={17} />
                </div>

                <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-800">
                        {name}
                    </p>

                    <p className="mt-0.5 text-xs text-gray-400">
                        {size}
                    </p>
                </div>
            </div>

            <button
                type="button"
                className="flex h-8 w-8 shrink-0 items-center
                justify-center rounded-lg text-gray-500
                transition hover:bg-gray-50 hover:text-gray-900"
            >
                <FiDownload size={16} />
            </button>
        </div>
    );
};

/* =====================================================
   ACTIVITY
===================================================== */

const Activity = ({
    icon,
    title,
    description,
    date,
    color = "blue",
    last = false,
}) => {
    const colors = {
        blue: "bg-blue-50 text-blue-600",
        purple: "bg-purple-50 text-purple-600",
        green: "bg-emerald-50 text-emerald-600",
        red: "bg-red-50 text-red-600",
    };

    return (
        <div className="relative flex gap-3">
            {!last && (
                <div
                    className="absolute left-[15px] top-8 h-[calc(100%+8px)]
                    w-px bg-gray-200"
                />
            )}

            {/* Icon */}
            <div
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center
                justify-center rounded-full ${colors[color]}`}
            >
                {icon}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                            {title}
                        </p>

                        <p className="mt-0.5 text-xs text-gray-500">
                            {description}
                        </p>
                    </div>

                    <span className="shrink-0 text-[11px] text-gray-400">
                        {date}
                    </span>
                </div>
            </div>
        </div>
    );
};

/* =====================================================
   EMPTY STATE
===================================================== */

const EmptyState = ({ text }) => {
    return (
        <div className="flex min-h-[120px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-400">{text}</p>
        </div>
    );
};

export default LeadDetailscopy;
