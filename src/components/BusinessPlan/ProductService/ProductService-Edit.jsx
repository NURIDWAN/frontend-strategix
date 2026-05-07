import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import ProductServiceForm from './ProductService-Form';
import { productServiceApi, backgroundApi } from '../../../services/businessPlan';
import { toast } from 'react-toastify';

const ProductServiceEdit = ({ product, onBack, onSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [businesses, setBusinesses] = useState([]);
    const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(true);
    const [previewImage, setPreviewImage] = useState(null);
    const [existingImageUrl, setExistingImageUrl] = useState(null);

    const [formData, setFormData] = useState({
        business_background_id: '',
        type: 'product',
        name: '',
        description: '',
        price: '',
        image_path: null,
        advantages: '',
        development_strategy: '',
        status: 'draft'
    });

    // Fetch business backgrounds untuk dropdown
    const fetchBusinesses = async () => {
        try {
            setIsLoadingBusinesses(true);
            const user = JSON.parse(localStorage.getItem('user'));

            if (!user?.id) {
                toast.error('User tidak ditemukan. Silakan login kembali.');
                return;
            }

            const response = await backgroundApi.getAll({
                user_id: user.id
            });

            if (response.data.status === 'success') {
                setBusinesses(response.data.data || []);
            } else {
                throw new Error(response.data.message || 'Failed to fetch business backgrounds');
            }
        } catch (error) {
            console.error('Error fetching businesses:', error);
            let errorMessage = 'Gagal memuat data bisnis';

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast.error(errorMessage);
        } finally {
            setIsLoadingBusinesses(false);
        }
    };

    useEffect(() => {
        fetchBusinesses();
    }, []);

    useEffect(() => {
        if (product) {
            setFormData({
                business_background_id: product.business_background_id || '',
                type: product.type || 'product',
                name: product.name || '',
                description: product.description || '',
                price: product.price || '',
                image_path: null,
                advantages: product.advantages || '',
                development_strategy: product.development_strategy || '',
                status: product.status || 'draft'
            });

            // Set existing image URL jika ada
            if (product.image_url) {
                setExistingImageUrl(product.image_url);
            } else if (product.image_path) {
                // Fallback: generate URL dari image_path
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
                setExistingImageUrl(`${API_URL}/get-image/${product.image_path}`);
            }
        }
    }, [product]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e, options = {}) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prevData) => ({
                ...prevData,
                image_path: file,
            }));

            // Kalau silent = true, jangan munculkan toast lagi
            if (!options.silent) {
                toast.success('Gambar berhasil dipilih');
            }
        }
    };

    const handleRemoveImage = () => {
        // Clean up preview URL
        if (previewImage) {
            URL.revokeObjectURL(previewImage);
        }

        setPreviewImage(null);
        setExistingImageUrl(null);
        setFormData(prev => ({
            ...prev,
            image_path: null
        }));

        // Reset file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) {
            fileInput.value = '';
        }

        toast.info('Gambar berhasil dihapus');
    };

    const handleSubmit = async (e, formDataWithBmc) => {
        e.preventDefault();

        // Validasi: business background harus dipilih
        if (!formData.business_background_id) {
            toast.error('Pilih bisnis terlebih dahulu');
            return;
        }

        // Validasi: nama dan deskripsi wajib diisi
        if (!formData.name.trim()) {
            toast.error('Nama produk/layanan harus diisi');
            return;
        }

        if (!formData.description.trim()) {
            toast.error('Deskripsi produk/layanan harus diisi');
            return;
        }

        // Validasi panjang nama
        if (formData.name.trim().length > 255) {
            toast.error('Nama produk/layanan maksimal 255 karakter');
            return;
        }

        setIsLoading(true);

        try {
            const user = JSON.parse(localStorage.getItem('user'));

            if (!user || !user.id) {
                throw new Error('User data not found. Please login again.');
            }

            // Buat FormData untuk update
            const submitData = new FormData();

            // Tambahkan semua field yang diperlukan
            submitData.append('user_id', user.id);
            submitData.append('business_background_id', formData.business_background_id);
            submitData.append('type', formData.type);
            submitData.append('name', formData.name.trim());
            submitData.append('description', formData.description.trim());
            submitData.append('status', formData.status);

            // Handle price - convert to number atau string kosong
            if (formData.price && formData.price !== '') {
                submitData.append('price', parseFloat(formData.price));
            } else {
                submitData.append('price', '');
            }

            // Handle optional fields
            submitData.append('advantages', formData.advantages?.trim() || '');
            submitData.append('development_strategy', formData.development_strategy?.trim() || '');

            // Append BMC alignment jika ada
            if (formDataWithBmc.bmc_alignment) {
                submitData.append('bmc_alignment', JSON.stringify(formDataWithBmc.bmc_alignment));
            }

            // Append file hanya jika ada file baru
            if (formData.image_path instanceof File) {
                submitData.append('image_path', formData.image_path);
            } else if (!existingImageUrl && product.image_path) {
                // Jika menghapus gambar yang sudah ada, kirim flag remove_image
                submitData.append('remove_image', 'true');
            }

            console.log('Updating product with data:', {
                user_id: user.id,
                business_background_id: formData.business_background_id,
                type: formData.type,
                name: formData.name,
                status: formData.status,
                hasNewImage: !!formData.image_path,
                removedExistingImage: !existingImageUrl && product.image_path,
                hasBmcAlignment: !!formDataWithBmc.bmc_alignment
            });

            // Gunakan update method
            const response = await productServiceApi.update(product.id, submitData);

            if (response.data.status === 'success') {
                toast.success('Produk/layanan berhasil diperbarui!');

                // Clean up preview URL
                if (previewImage) {
                    URL.revokeObjectURL(previewImage);
                }

                // Panggil callback success dengan data terbaru
                if (onSuccess) {
                    onSuccess(response.data.data);
                }
            } else {
                throw new Error(response.data.message || 'Terjadi kesalahan saat memperbarui produk/layanan');
            }
        } catch (error) {
            console.error('Error updating product/service:', error);

            let errorMessage = 'Terjadi kesalahan saat memperbarui produk/layanan';

            if (error.response?.status === 403) {
                errorMessage = 'Anda tidak memiliki izin untuk mengubah data ini. Pastikan data ini milik Anda.';
            } else if (error.response?.status === 422) {
                // Validation errors
                if (error.response.data?.errors) {
                    const errors = error.response.data.errors;
                    const firstError = Object.values(errors)[0];
                    errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
                } else if (error.response.data?.message) {
                    errorMessage = error.response.data.message;
                }
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast.error(errorMessage);

            // Debug info
            console.log('Error details:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Cleanup preview URL ketika component unmount
    useEffect(() => {
        return () => {
            if (previewImage) {
                URL.revokeObjectURL(previewImage);
            }
        };
    }, [previewImage]);

    if (!product) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">Memuat data produk...</p>
                </div>
            </div>
        );
    }

    return (
        <ProductServiceForm
            title="Edit Produk/Layanan"
            subtitle="Perbarui informasi produk/layanan dan integrasi Business Model Canvas"
            formData={formData}
            businesses={businesses}
            isLoadingBusinesses={isLoadingBusinesses}
            isLoading={isLoading}
            previewImage={previewImage}
            existingImageUrl={existingImageUrl}
            onInputChange={handleInputChange}
            onFileChange={handleFileChange}
            onRemoveImage={handleRemoveImage}
            onSubmit={handleSubmit}
            onBack={onBack}
            submitButtonText="Perbarui Produk/Layanan"
            submitButtonIcon={<Save size={16} />}
            mode="edit"
            existingProduct={product}
        />
    );
};

export default ProductServiceEdit;