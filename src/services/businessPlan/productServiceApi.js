import api from '../authApi';

export const productServiceApi = {
    getAll: (params = {}) => api.get("/product-service", { params }),
    
    getById: (id) => api.get(`/product-service/${id}`),
    
    create: (productData) => {
        return api.post("/product-service", productData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },
    
    update: (id, productData) => {
        const formData = productData instanceof FormData ? productData : new FormData();
        
        if (!(productData instanceof FormData)) {
            for (const key in productData) {
                if (productData.hasOwnProperty(key)) {
                    if (productData[key] !== null && productData[key] !== undefined) {
                        if (productData[key] instanceof File) {
                            formData.append(key, productData[key]);
                        } else if (typeof productData[key] === 'object') {
                            formData.append(key, JSON.stringify(productData[key]));
                        } else {
                            formData.append(key, productData[key]);
                        }
                    }
                }
            }
        }
        
        if (!formData.has('_method')) {
            formData.append('_method', 'PUT');
        }
        
        return api.post(`/product-service/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },
    
    delete: (id, userId) => {
        return api.delete(`/product-service/${id}`, { 
            data: { user_id: userId } 
        });
    },

    // New methods untuk BMC alignment
    generateBmcAlignment: (id) => {
        return api.post(`/product-service/${id}/generate-bmc-alignment`);
    },

    getStatistics: (params = {}) => {
        return api.get('/product-service/statistics/overview', { params });
    }
};

export default productServiceApi;