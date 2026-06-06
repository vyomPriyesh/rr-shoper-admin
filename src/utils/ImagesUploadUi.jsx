import { useMutation } from '@tanstack/react-query';
import { Upload } from 'antd';
import React, { useMemo, useState } from 'react';
import { RiUploadCloud2Fill } from 'react-icons/ri';
import apiList from '../config/apiList';
import api from '../config/api';
import ImageWithPreview from './ImageWithPreview';

const ImagesUploadUi = ({ multiple = false, onChange, value }) => {

    const { images } = apiList();

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
                    name: img,
                    status: "done",
                    url:
                        images.imgUrl + img,
                    image: img,
                }));

                onChange?.(imagesList);
            }
        },
    });

    const handleChange = ({ fileList }) => {
        if (!fileList.length) return;

        imageHandle({ files: fileList });
    };

    const handlePreview = (file) => {
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

        return [];

    }, [multiple, value, isPending]);

    const handleRemove = (file) => {

        // single image
        if (!multiple) {
            onChange();
            return true;
        }
    };

    return (
        <div>
            <Upload
                listType="picture-card"
                multiple={multiple}
                beforeUpload={() => false}
                onChange={handleChange}
                onPreview={handlePreview}
                fileList={fileList}
                // showUploadList
                onRemove={handleRemove}
            >
                {!isPending &&
                    (
                        multiple ||
                        !value?.url
                    ) && (
                        <button
                            type="button"
                            className="text-lg flex flex-col place-items-center justify-center"
                            style={{
                                border: 0,
                                background: "none",
                            }}
                        >
                            <span className="text-2xl">
                                <RiUploadCloud2Fill />
                            </span>

                            <div style={{ marginTop: 8 }}>
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