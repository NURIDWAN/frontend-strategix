import api from '../authApi';

export const backgroundApi = {
    getAll: () => api.get("/business-background"),

    getById: (id) => api.get(`/business-background/${id}`),

    create: (businessData) => {
        if (businessData.logo instanceof File) {
            const formData = new FormData();
            Object.keys(businessData).forEach((key) => {
                if (businessData[key] !== null && businessData[key] !== undefined) {
                    formData.append(key, businessData[key]);
                }
            });
            return api.post("/business-background", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
        }
        return api.post("/business-background", businessData);
    },

    update: (id, businessData) => {
        // Cek apakah ada file untuk upload
        const hasLogo = businessData.logo instanceof File;
        const hasBackground = businessData.background_image instanceof File;
        const hasLogoDelete = businessData.logo === null;
        const hasBackgroundDelete = businessData.background_image === null;

        if (hasLogo || hasBackground || hasLogoDelete || hasBackgroundDelete) {
            const formData = new FormData();
            
            Object.keys(businessData).forEach((key) => {
                // Jangan append field yang undefined
                if (businessData[key] !== undefined) {
                    if ((key === 'logo' || key === 'background_image') && businessData[key] === null) {
                        // Kirim string kosong untuk hapus file
                        formData.append(key, '');
                    } else if (businessData[key] instanceof File) {
                        formData.append(key, businessData[key]);
                    } else if (businessData[key] !== null) {
                        formData.append(key, businessData[key]);
                    }
                }
            });
            
            formData.append("_method", "PUT");
            console.log('Sending FormData to PUT:', Array.from(formData.entries()));
            return api.post(`/business-background/${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
        }
        
        // Jika tidak ada file, gunakan PUT biasa
        console.log('Sending regular PUT:', businessData);
        return api.put(`/business-background/${id}`, businessData);
    },

    delete: (id) => api.delete(`/business-background/${id}`),

    getForDropdown: () => api.get("/business-backgrounds"),
};

export default backgroundApi;