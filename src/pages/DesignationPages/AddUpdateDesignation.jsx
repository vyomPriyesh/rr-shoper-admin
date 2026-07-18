import React, { useEffect, useState, useMemo, useCallback } from "react";
import PageTitleAddbtn from "../../utils/PageTitleAddbtn";
import TableUi from "../../utils/TableUi";
import InputField from "../../utils/InputField";
import { useToast } from "../../context/ToastContext";
import apiList from "../../config/apiList";
import api from "../../config/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { userState } from "../../context/UserContext";

const AddUpdateDesignation = ({ links }) => {

    const { showToast } = useToast();
    const { designations } = apiList();
    const { user } = userState();
    const navigate = useNavigate();
    const { id } = useParams();

    const [designationName, setDesignationName] = useState(null)
    const [rowData, setRowData] = useState([])

    // Fetch designation data if editing
    const { data: designationData } = useQuery({
        queryKey: ['designation-edit', id],
        queryFn: () => api.get(designations.getDesignation(id)),
        enabled: !!id && !!user,
        select: ({ data }) => data?.data
    })

    // Memoize computed rowData structure
    const computedRowData = useMemo(() => {
        if (designationData && links) {
            return links.map((list, index) => ({
                key: index,
                module_name: list.name,
                actions: {
                    view: designationData?.permissions?.[index]?.actions?.view || false,
                    add: designationData?.permissions?.[index]?.actions?.add || false,
                    update: designationData?.permissions?.[index]?.actions?.update || false,
                    delete: designationData?.permissions?.[index]?.actions?.delete || false,
                }
            }));
        } else if (links) {
            return links.map((list, index) => ({
                key: index,
                module_name: list.name,
                actions: {
                    view: false,
                    add: false,
                    update: false,
                    delete: false,
                }
            }));
        }
        return [];
    }, [designationData, links]);

    // Sync computed rowData to state
    useEffect(() => {
        setRowData(computedRowData);
    }, [computedRowData]);

    // Populate designation name when editing
    useEffect(() => {
        if (designationData) {
            setDesignationName(designationData?.name)
        }
    }, [designationData]);

    const handlePermissionChange = useCallback((rowIndex, field, checked) => {
        setRowData((prev) =>
            prev.map((row, index) =>
                index === rowIndex
                    ? {
                        ...row,
                        actions: {
                            ...row.actions,
                            [field]: checked,
                        },
                    }
                    : row
            )
        );
    }, []);

    const columns = useMemo(() => [
        {
            title: "Module Name",
            dataIndex: "module_name",
            key: "module_name",
        },
        {
            title: "View",
            key: "view",
            render: (_, record, index) => (
                <InputField
                    type="switch"
                    checked={record.actions.view}
                    unCheckedChildren={false}
                    checkedChildren={false}
                    onChange={(checked) =>
                        handlePermissionChange(index, "view", checked)
                    }
                />
            ),
        },
        {
            title: "Add",
            key: "add",
            render: (_, record, index) => (
                <InputField
                    type="switch"
                    checked={record.actions.add}
                    unCheckedChildren={false}
                    checkedChildren={false}
                    disabled={!record.actions.view}
                    onChange={(checked) =>
                        handlePermissionChange(index, "add", checked)
                    }
                />
            ),
        },
        {
            title: "Update",
            key: "update",
            render: (_, record, index) => (
                <InputField
                    type="switch"
                    checked={record.actions.update}
                    unCheckedChildren={false}
                    checkedChildren={false}
                    disabled={!record.actions.view}
                    onChange={(checked) =>
                        handlePermissionChange(index, "update", checked)
                    }
                />
            ),
        },
        {
            title: "Delete",
            key: "delete",
            render: (_, record, index) => (
                <InputField
                    type="switch"
                    checked={record.actions.delete}
                    unCheckedChildren={false}
                    checkedChildren={false}
                    disabled={!record.actions.view}
                    onChange={(checked) =>
                        handlePermissionChange(index, "delete", checked)
                    }
                />
            ),
        },
    ], [handlePermissionChange]);

    const { mutate: addDesignation, isPending: addDesignationPending } = useMutation({
        mutationFn: (payload) => {
            if (id) {
                return api.post(designations.updateDesignation(id), payload)
            }
            return api.post(designations.add, payload)
        },
        onSuccess: ({ data }) => {
            showToast(data.message, "success");
            navigate(-1);
        },
        onError: ({ response }) => {
            showToast(response.data.error.error_message, "error");
        }
    })

    const validationErrors = useMemo(() => {
        if (!designationName) {
            return { valid: false, error: 'Please Enter Designation Name' };
        }

        const hasPermission = rowData.some((row) =>
            Object.values(row.actions).some((value) => value)
        );

        if (!hasPermission) {
            return { valid: false, error: 'Please enable at least one permission.' };
        }

        const invalidModule = rowData.find((row) => {
            const { view, add, update, delete: remove } = row.actions;
            return !view && (add || update || remove);
        });

        if (invalidModule) {
            return { valid: false, error: `${invalidModule.module_name}: View permission is required.` };
        }

        return { valid: true };
    }, [designationName, rowData]);

    const handleSave = useCallback(() => {
        if (!validationErrors.valid) {
            showToast(validationErrors.error, "error");
            return;
        }

        const payload = {
            name: designationName.toLowerCase(),
            permissions: rowData.filter((row) =>
                Object.values(row.actions).some((value) => value)
            ),
        }
        addDesignation(payload)
    }, [validationErrors, designationName, rowData, showToast, addDesignation]);

    return (
        <div className="flex flex-col gap-5">
            <PageTitleAddbtn title={id ? "Edit Designation" : "Add Designation"} add addText='Save' addClick={handleSave} />
            <InputField className='!w-60 capitalize' placeholder='Enter Designation Name' value={designationName} onChange={(e) => setDesignationName(e.target.value)} />
            <TableUi columns={columns} data={rowData} />
        </div>
    );
};

export default AddUpdateDesignation;