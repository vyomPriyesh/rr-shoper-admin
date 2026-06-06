import { Image } from 'antd'
import React from 'react'

const ImageWithPreview = ({ preview, setPreview }) => {
    return <Image
        styles={{
            root: { display: 'none' },
        }}
        preview={{
            open: preview.open,
            onOpenChange: (visible) =>
                setPreview((prev) => ({
                    ...prev,
                    open: visible,
                })),
        }}
        src={preview.image}
    />
}

export default ImageWithPreview
