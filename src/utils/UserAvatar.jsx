import React from 'react'
import apiList from '../config/apiList'

const UserAvatar = ({ image, name, className, isLoading }) => {

    const { images } = apiList();
    const avatarClass = className || "2xl:h-9 2xl:w-9 md:h-8 md:w-8 w-8 h-8 rounded-full object-cover";

    if (isLoading) {
        return <div className={`${avatarClass} animate-pulse bg-gray-300/80`} />
    }

    return (
        <img src={image ? images?.imgUrl + image : `https://ui-avatars.com/api/?background=B06A8D&color=fff&name=${name || 'RR'}`}
            alt="Profile"
            className={avatarClass}
        />
    )
}

export default UserAvatar
