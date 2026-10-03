import React, { useEffect, useMemo, useRef } from 'react'
import ButtonUi from './ButtonUi'
import * as XLSX from 'xlsx';
import apiList from '../config/apiList';
import api from '../config/api';
import { displayDate } from './DateDisplay';
import { userState } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { useMutation } from '@tanstack/react-query';
import Filters from './Filters';

const PageTitleAddbtn = ({
    title,
    add,
    addClick,
    addText,
    className,
    otherButtons = [],
    importButton,
    displayStatus,
    exportApiName,
    filter,
    ...rest
}) => {

    const { importFile } = apiList()
    const { setLoading } = userState()
    const { showToast } = useToast();

    const fileInputRef = useRef(null);

    const handleImport = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const { mutate: handleImportApi, isPending: importPending } = useMutation({
        mutationFn: (formattedData) => api.post(importFile(exportApiName), { data: formattedData }),
        onSuccess: ({ data }) => {
            importButton.refresh()
            showToast(data.message, 'success');
        },
    });

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = async (evt) => {
            const bstr = evt.target.result;
            const workbook = XLSX.read(bstr, { type: 'binary' });

            const wsname = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[wsname];

            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                header: 2,
                raw: false,
                dateNF: "dd-mm-yyyy",
            });

            const formattedData = jsonData.map((row) => {
                const formattedRow = { ...row };

                Object.keys(formattedRow).forEach((key) => {
                    if (key.endsWith("_date")) {
                        formattedRow[key] = displayDate(formattedRow[key]);
                    }
                });

                return formattedRow;
            });
            handleImportApi(formattedData)
        };

        reader.readAsBinaryString(file);
    };

    const isLoading = useMemo(() => importPending, [importPending])

    useEffect(() => {
        if (isLoading == undefined || isLoading == null) return
        setLoading(isLoading)
    }, [isLoading])


    return (
        <div className="flex justify-between gap-5 bg-white rounded-lg p-5">
            <div className="flex flex-row gap-5 items-center">
                <h2 className='text-xl font-semibold'>{title}</h2>
                {filter && <Filters />}
            </div>
            <div className="flex justify-between gap-5">
                {otherButtons?.length > 0 &&
                    otherButtons?.map((list, i) => (
                        <ButtonUi disabled={list.disabled} onClick={list.addClick} type={list.type} text={list.addText || 'Add'} {...list} className={`text-sm !px-4 ${list.className}`} />
                    ))
                }
                {displayStatus && displayStatus}
                {importButton &&
                    <>
                        <ButtonUi onClick={handleImport} type='button' text='Import' className={`text-sm md:!px-4 !px-3 !bg-blue-500 border-0 hover:!bg-blue-500 hover:text-white hover:scale-105 ${importButton.className}`} />
                        <input
                            type="file"
                            ref={fileInputRef}
                            className='hidden'
                            accept=".xls,.xlsx,.xlsm,.xlsb,.csv"
                            onChange={(e) => handleFileUpload(e)}
                        />
                    </>
                }
                {add &&
                    <ButtonUi disabled={rest.disabled} onClick={addClick} type={rest.type} text={addText || 'Add'} {...rest} className='text-sm md:!px-4 !px-3' />
                }
            </div>
        </div>
    )
}

export default PageTitleAddbtn
