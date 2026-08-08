import { useMutation } from '@tanstack/react-query';
import { Upload } from 'antd';
import React, { useMemo, useState } from 'react';
import { RiDeleteBin6Line, RiUploadCloud2Fill } from 'react-icons/ri';
import apiList from '../config/apiList';
import api from '../config/api';
import ImageWithPreview from './ImageWithPreview';
import { useToast } from '../context/ToastContext';
import {
    FiFileText,
    FiFile,
} from "react-icons/fi";

import {
    FaFilePdf,
    FaFileWord,
    FaFileExcel,
    FaFilePowerpoint,
} from "react-icons/fa";

const ImagesUploadUi = ({
    multiple = false,
    onChange,
    value,
    imageLimit = 1,
    readOnly = false,
}) => {
    const { images } = apiList();
    const { showToast } = useToast();

    const [preview, setPreview] = useState({
        open: false,
        image: "",
    });

    const { mutate: imageHandle, isPending } = useMutation({
        mutationFn: ({ files }) => {

            const formData = new FormData();

            files.forEach((file) => {
                if (file.originFileObj) {
                    formData.append("images", file.originFileObj);
                }
            });

            return api.post(images.upload, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
        },

        onSuccess: ({ data }) => {

            const uploadedImages = data?.data?.result || [];

            if (!multiple) {
                const image = {
                    uid: uploadedImages[0]?._id,
                    name: uploadedImages[0]?.image,
                    status: "done",
                    url:
                        images.imgUrl +
                        uploadedImages[0]?.image,

                    image: uploadedImages[0]?.image,
                };

                onChange?.(image);
            } else {
                const imagesList = uploadedImages.map((img, index) => ({
                    uid: String(index),
                    name: img.image,
                    status: "done",
                    url: images.imgUrl + img.image,
                    image: img.image,
                }));

                onChange?.([...(value || []), ...imagesList]);
            }
        },
    });

    const getDocumentInfo = (file) => {
        const fileName = file?.name || file?.url || "";
        const name = fileName.split("/").pop();
        const extension = name
            .split(".")
            .pop()
            ?.toLowerCase();

        const configs = {
            pdf: {
                icon: FaFilePdf,
                color: "#EF4444",
            },

            doc: {
                icon: FaFileWord,
                color: "#2563EB",
            },

            docx: {
                icon: FaFileWord,
                color: "#2563EB",
            },

            xls: {
                icon: FaFileExcel,
                color: "#16A34A",
            },

            xlsx: {
                icon: FaFileExcel,
                color: "#16A34A",
            },

            csv: {
                icon: FaFileExcel,
                color: "#16A34A",
            },

            ppt: {
                icon: FaFilePowerpoint,
                color: "#EA580C",
            },

            pptx: {
                icon: FaFilePowerpoint,
                color: "#EA580C",
            },

            txt: {
                icon: FiFileText,
                color: "#6B7280",
            },
        };

        return {
            name,
            extension,
            ...(configs[extension] || {
                icon: FiFile,
                color: "#9CA3AF",
            }),
        };
    };


    const handlePreview = (file) => {
        const url =
            file.url ||
            (file.originFileObj
                ? URL.createObjectURL(file.originFileObj)
                : "");

        if (!url) return;

        const fileName = file.name || file.url || "";

        const extension =
            fileName
                .split("?")[0]
                .split(".")
                .pop()
                ?.toLowerCase();

        const documentExtensions = [
            "pdf",
            "doc",
            "docx",
            "xls",
            "xlsx",
            "ppt",
            "pptx",
            "txt",
            "csv",
        ];
        if (documentExtensions.includes(extension)) {
            window.open(url, "_blank", "noopener,noreferrer");
            return;
        }
        setPreview({
            open: true,
            image:
                file.url ||
                URL.createObjectURL(file.originFileObj),
        });
    };

    const fileList = useMemo(() => {

        if (!multiple) {
            return [
                {
                    uid: "0",
                    name: value?.image || "uploading.png",
                    status: isPending ? "uploading" : value?.url ? "done" : undefined,
                    ...(value?.url && {
                        url: value.url,
                    }),
                },
            ].filter(item => item.status);
        }

        return (value || []).map((item, index) => ({
            uid: item.uid || String(index),
            name: item.image || item.name || `image-${index}`,
            status: "done",
            url: item.url,
            image: item.image,
        }));

    }, [multiple, value, isPending]);

    const handleRemove = (file) => {
        if (readOnly) {
            return false;
        }

        // single image
        if (!multiple) {
            onChange();
            return true;
        }
        const updated = (value || []).filter(item => item.name !== file.name);

        onChange?.(updated);

        return true;
    };

    const handleBatchStart = (batchFileInfoList) => {
        if (readOnly) {
            return;
        }

        const currentCount = value?.length || 0;
        const remaining = imageLimit - currentCount;

        if (remaining <= 0) {
            showToast(
                `You can upload a maximum of ${imageLimit} images.`,
                "warning"
            );
            return;
        }

        if (batchFileInfoList.length > imageLimit) {
            showToast(
                `You can upload ${remaining} only image${remaining > 1 ? "s" : ""
                }.`,
                "warning"
            );
        }

        imageHandle({
            files: batchFileInfoList
                .slice(0, remaining)
                .map((item) => ({
                    originFileObj: item.file,
                })),
        });
    };

    return (
        <div>
            <Upload
                listType="picture-card"
                multiple={multiple}
                beforeUpload={() => false}
                maxCount={multiple ? imageLimit : 1}
                onBatchStart={handleBatchStart}
                onPreview={handlePreview}
                fileList={fileList}
                itemRender={(originNode, file) => {
                    // Keep Ant Design's normal image preview
                    const isImage =
                        file.type?.startsWith("image/") ||
                        /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(
                            file.name || file.url || ""
                        );

                    if (isImage) {
                        return originNode;
                    }

                    // Custom document preview
                    const { icon: Icon, color, name } = getDocumentInfo(file);

                    return (
                        <div
                            className="relative flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg bg-black/10"
                            onClick={() => handlePreview(file)}
                        >
                            {!readOnly && (
                                <button
                                    type="button"
                                    className="absolute right-1 top-1 z-[50] flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white transition hover:bg-red-600"
                                    onClick={(e) => {
                                        e.stopPropagation();

                                        // Remove file
                                        handleRemove?.(file);
                                    }}
                                >
                                    <RiDeleteBin6Line size={14} />
                                </button>
                            )}
                            <Icon
                                size={48}
                                style={{
                                    color,
                                }}
                            />
                            <div className=" mt-2 w-full truncate px-2 text-center text-xs text-gray-600">
                                {name}
                            </div>
                        </div>
                    );
                }}
                onRemove={handleRemove}
                showUploadList={{
                    showPreviewIcon: true,
                    showRemoveIcon: !readOnly,
                }}
                openFileDialogOnClick={!readOnly}
            >
                {!readOnly &&
                    !isPending &&
                    (multiple || !value?.url) && (
                        <button
                            type="button"
                            className="flex flex-col items-center justify-center text-lg"
                            style={{
                                border: 0,
                                background: "none",
                            }}
                        >
                            <span className="text-2xl">
                                <RiUploadCloud2Fill />
                            </span>

                            <div className="mt-2">
                                Upload
                            </div>
                        </button>
                    )}
            </Upload>
            <ImageWithPreview preview={preview} setPreview={setPreview} />
        </div>
    );
};

export default ImagesUploadUi;