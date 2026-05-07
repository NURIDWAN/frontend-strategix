import { useState } from 'react';
import { Save } from 'lucide-react';
import BackgroundForm from './Background-Form';
import { backgroundApi } from '../../../services/businessPlan';
import { toast } from 'react-toastify';

const BackgroundCreate = ({ onBack, onSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [logoPreview, setLogoPreview] = useState(null);
    const [backgroundPreview, setBackgroundPreview] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        description: '',
        purpose: '',
        location: '',
        business_type: '',
        start_date: '',
        values: '',
        vision: '',
        mission: '',
        contact: '',
        logo: null,
        background_image: null
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e, fileType) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size
            const maxSize = fileType === 'background' ? 5 * 1024 * 1024 : 2 * 1024 * 1024; // 5MB for background, 2MB for logo
            if (file.size > maxSize) {
                const sizeInMB = maxSize / (1024 * 1024);
                toast.error(`Ukuran file maksimal ${sizeInMB}MB`);
                return;
            }
            
            if (fileType === 'logo') {
                setFormData(prev => ({ ...prev, logo: file }));
            } else if (fileType === 'background') {
                setFormData(prev => ({ ...prev, background_image: file }));
            }
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                if (fileType === 'logo') {
                    setLogoPreview(e.target.result);
                } else if (fileType === 'background') {
                    setBackgroundPreview(e.target.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const removeLogo = () => {
        setFormData(prev => ({ ...prev, logo: null }));
        setLogoPreview(null);
    };

    const removeBackground = () => {
        setFormData(prev => ({ ...prev, background_image: null }));
        setBackgroundPreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            
            if (!user || !user.id) {
                throw new Error('User data not found');
            }

            const submitData = {
                ...formData,
                user_id: user.id
            };

            console.log('Submitting business data:', submitData);
            const response = await backgroundApi.create(submitData);

            if (response.data.status === 'success') {
                // Tampilkan notifikasi sukses dengan react-toastify
                toast.success('Data bisnis berhasil dibuat!');
                onSuccess();
            } else {
                throw new Error(response.data.message || 'Terjadi kesalahan');
            }
        } catch (error) {
            console.error('Error creating business:', error);
            
            let errorMessage = 'Terjadi kesalahan saat membuat data bisnis';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.errors) {
                // Handle validation errors
                const errors = Object.values(error.response.data.errors).flat();
                errorMessage = errors.join(', ');
            }
            
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <BackgroundForm
            title="Tambah Bisnis Baru"
            subtitle="Isi formulir untuk menambahkan bisnis baru"
            formData={formData}
            logoPreview={logoPreview}
            backgroundPreview={backgroundPreview}
            isLoading={isLoading}
            onInputChange={handleInputChange}
            onFileChange={handleFileChange}
            onRemoveLogo={removeLogo}
            onRemoveBackground={removeBackground}
            onSubmit={handleSubmit}
            onBack={onBack}
            submitButtonText="Simpan Bisnis"
            submitButtonIcon={<Save size={16} />}
            mode="create"
        />
    );
};

export default BackgroundCreate;