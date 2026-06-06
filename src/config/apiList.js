const apiList = () => {
    return {
        auth: {
            profile: "profile",
            login: 'login',
        },

        images: {
            imgUrl: import.meta.env.VITE_IMAGES_URL,
            upload: 'images/upload',
        },

        platforms: {
            add: 'add-platform',
            all: 'all-platforms',
            updatePlatform: (id) => `platforms/update-platform/${id}`,
            statusUpdate: (id) => `platforms/update-status/${id}`,
            deletePlatform: (id) => `platforms/delete-platform/${id}`,
        },
    }
}

export default apiList;