const apiList = () => {
    return {
        auth: {
            profile: "profile",
            login: 'login',
        },

        allOptions: {
            get: 'admin-all-options',
        },

        customers: {
            all: 'allCustomers',
            add: 'customers/add-customer',
            updateCustomer: (id) => `customers/update-customer/${id}`,
            deleteCustomer: (id) => `customers/delete-customer/${id}`,
            statusUpdate: (id) => `customers/update-status/${id}`,
        },

        users: {
            all: 'allUsers',
            add: 'users/add-user',
            updateUser: (id) => `users/update-user/${id}`,
            deleteUser: (id) => `users/delete-user/${id}`,
            updateRole: (id, role) => `users/update-role/${id}/${role}`,
            updateDesignation: (id, designation) => `users/update-designation/${id}/${designation}`,
            statusUpdate: (id) => `users/update-status/${id}`,
        },

        tickets: {
            allTicketsTitle: 'allTicketsTitle',
            addTicketsTitle: 'tickets-title/add-tickets-title',
            updateTicketsTitle: (id) => `tickets-title/update-tickets-title/${id}`,
            deleteTicketsTitle: (id) => `tickets-title/delete-tickets-title/${id}`,
            statusUpdate: (id) => `tickets-title/update-status/${id}`,
            allTicketForms: 'allTicketForm',
            addTicketForm: 'ticket-form/add-ticket-form',
            updateTicketForm: (id) => `ticket-form/update-ticket-form/${id}`,
            updateTicketFormStatus: (id) => `ticket-form/update-status/${id}`,
            deleteTicketForm: (id) => `ticket-form/delete-ticket-form/${id}`,
            getTicketForm: (id) => `ticket-form/${id}`,
        },

        leadTitles: {
            allLeadTitles: 'allLeadTitles',
            addLeadTitles: 'lead-titles/add-lead-title',
            updateLeadTitle: (id) => `lead-titles/update-lead-title/${id}`,
            deleteLeadTitle: (id) => `lead-titles/delete-lead-title/${id}`,
            updateleadTitleUpdate: (id) => `lead-titles/update-lead-title-status/${id}`,
        },

        leadsForms: {
            allLeadForms: 'allLeadForms',
            addLeadForm: 'lead-forms/add-lead-form',
            updateleadForm: (id) => `lead-forms/update-lead-form/${id}`,
            updateleadFormStatus: (id) => `lead-forms/update-lead-form-status/${id}`,
            deleteleadForm: (id) => `lead-forms/delete-lead-form/${id}`,
            getleadForm: (id) => `lead-forms/${id}`,
        },

        leads: {
            allLeads: 'allLeads',
            addLead: 'leads/add-lead',
            updateLead: (id) => `leads/update-lead/${id}`,
            updateLeadStatus: (id) => `leads/update-lead-status/${id}`,
            deleteLead: (id) => `leads/delete-lead/${id}`,
            getLead: (id) => `leads/${id}`,
            getFormsByLeadTitle: (leadTitle) => `lead-forms/by-lead-title/${leadTitle}`,
            findCustomer: `/leads/findCustomer`
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