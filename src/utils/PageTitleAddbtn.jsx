import React, { useRef } from 'react'
import ButtonUi from './ButtonUi'
import * as XLSX from 'xlsx';

const PageTitleAddbtn = ({ title, add, addClick, addText, className, otherButtons = [], importButton, displayStatus, ...rest }) => {

    const fileInputRef = useRef(null);

    const handleImport = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = async (evt) => {
            const bstr = evt.target.result;
            const workbook = XLSX.read(bstr, { type: 'binary' });

            const wsname = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[wsname];

            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 2 });

            const res = await apiPost(exportApi.dataCheck(exportApiName), { data: jsonData })
            if (res.success) {
                importClick(res.data.result)
            }

        };

        reader.readAsBinaryString(file);
    };


    return (
        <div className="flex justify-between gap-5">
            <h2 className='text-xl font-semibold'>{title}</h2>
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
