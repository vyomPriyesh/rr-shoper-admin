const apiList = () => {
    return {
        auth: {
            profile: "profile",
            login: 'login',
        },

        allOptions: {
            get: 'admin-all-options',
        },

        users: {
            all: 'allUsers',
            updateRole: (id, role) => `users/update-role/${id}/${role}`,
            updateDesignation: (id, designation) => `users/update-designation/${id}/${designation}`,
            statusUpdate: (id) => `users/update-status/${id}`,
        },

        designations: {
            all: 'allDesignation',
            add: 'designation/add-designation',
            updateDesignation: (id) => `designation/update-designation/${id}`,
            updateStatus: (id) => `designation/update-status/${id}`,
            getDesignation: (id) => `designation/${id}`,
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
            updatePopularPackage: (id) => `packages/update-popular-package/${id}`,
        },
    }
}

export default apiList;