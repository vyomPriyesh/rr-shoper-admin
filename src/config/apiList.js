const apiList = () => {
    return {
        auth: {
            profile: "profile",
            login: 'login',
        },

        allOptions: {
            get: 'all-options',
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
        packages: {
            add: 'add-package',
            all: 'all-packages',
            updatePackage: (id) => `packages/update-package/${id}`,
            statusUpdate: (id) => `packages/update-status/${id}`,
            deletePackage: (id) => `packages/delete-package/${id}`,
        },
    }
}

export default apiList;