import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import ProductServiceForm from './ProductService-Form';
import { productServiceApi, backgroundApi } from '../../../services/businessPlan';
import { toast } from 'react-toastify';

const ProductServiceCreate = ({ onBack, onSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [businesses, setBusinesses] = useState([]);
    const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(true);

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

            const response = await backgroundApi.getAll({
                user_id: user?.id
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

            if (!options.silent) {
                toast.success('Gambar berhasil dipilih');
            }
        }
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

            const submitData = new FormData();
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

            // Handle optional fields - selalu append meski kosong
            submitData.append('advantages', formData.advantages?.trim() || '');
            submitData.append('development_strategy', formData.development_strategy?.trim() || '');

            // Append BMC alignment jika ada
            if (formDataWithBmc.bmc_alignment) {
                submitData.append('bmc_alignment', JSON.stringify(formDataWithBmc.bmc_alignment));
            }

            // Append file hanya jika ada file
            if (formData.image_path instanceof File) {
                submitData.append('image_path', formData.image_path);
            }

            console.log('Creating product with data:', {
                user_id: user.id,
                business_background_id: formData.business_background_id,
                type: formData.type,
                name: formData.name,
                status: formData.status,
                hasImage: !!formData.image_path,
                hasBmcAlignment: !!formDataWithBmc.bmc_alignment
            });

            const response = await productServiceApi.create(submitData);

            if (response.data.status === 'success') {
                toast.success('Produk/layanan berhasil dibuat!');
                onSuccess();
            } else {
                throw new Error(response.data.message || 'Terjadi kesalahan saat membuat produk/layanan');
            }
        } catch (error) {
            console.error('Error creating product/service:', error);

            let errorMessage = 'Terjadi kesalahan saat membuat produk/layanan';

            if (error.response?.status === 403) {
                errorMessage = 'Anda tidak memiliki izin untuk membuat data ini. Pastikan Anda login dengan benar.';
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

    return (
        <ProductServiceForm
            title="Tambah Produk/Layanan"
            subtitle="Isi formulir untuk menambahkan produk/layanan baru dengan integrasi Business Model Canvas"
            formData={formData}
            businesses={businesses}
            isLoadingBusinesses={isLoadingBusinesses}
            isLoading={isLoading}
            onInputChange={handleInputChange}
            onFileChange={handleFileChange}
            onSubmit={handleSubmit}
            onBack={onBack}
            submitButtonText="Simpan Produk/Layanan"
            submitButtonIcon={<Save size={16} />}
            mode="create"
        />
    );
};

export default ProductServiceCreate;