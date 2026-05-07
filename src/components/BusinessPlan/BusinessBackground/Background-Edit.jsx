import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import BackgroundForm from './Background-Form';
import { backgroundApi } from '../../../services/businessPlan';
import { toast } from 'react-toastify';

const BackgroundEdit = ({ business, onBack, onSuccess }) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const [isLoading, setIsLoading] = useState(false);
    const [logoPreview, setLogoPreview] = useState(null);
    const [backgroundPreview, setBackgroundPreview] = useState(null);
    const [currentLogo, setCurrentLogo] = useState(null);
    const [currentBackground, setCurrentBackground] = useState(null);

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
        logo: undefined,
        background_image: undefined
    });

    useEffect(() => {
        if (business) {
            setFormData({
                name: business.name || '',
                category: business.category || '',
                description: business.description || '',
                purpose: business.purpose || '',
                location: business.location || '',
                business_type: business.business_type || '',
                start_date: business.start_date || '',
                values: business.values || '',
                vision: business.vision || '',
                mission: business.mission || '',
                contact: business.contact || '',
                logo: undefined,
                background_image: undefined
            });

            if (business.logo) {
                setLogoPreview(`${API_URL}/get-image/${business.logo}`);
                setCurrentLogo(business.logo);
            }

            if (business.background_image) {
                setBackgroundPreview(`${API_URL}/get-image/${business.background_image}`);
                setCurrentBackground(business.background_image);
            }
        }
    }, [business]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e, fileType) => {
        const file = e.target.files[0];
        if (file) {
            const maxSize = fileType === 'background' ? 5 * 1024 * 1024 : 2 * 1024 * 1024;
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
        setCurrentLogo(null);
    };

    const removeBackground = () => {
        setFormData(prev => ({ ...prev, background_image: null }));
        setBackgroundPreview(null);
        setCurrentBackground(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const user = JSON.parse(localStorage.getItem('user'));

            if (!user || !user.id) {
                throw new Error('User data not found');
            }

            // Siapkan data untuk update
            const submitData = {
                ...formData,
                user_id: user.id,
            };

            // Hapus field jika undefined (biarkan tetap), tapi jangan hapus user_id
            if (submitData.logo === undefined) {
                delete submitData.logo;
            }
            if (submitData.background_image === undefined) {
                delete submitData.background_image;
            }

            console.log('Updating business data:', submitData);
            console.log('Form data before submit:', formData);

            const response = await backgroundApi.update(business.id, submitData);

            if (response.data.status === 'success') {
                toast.success('Data bisnis berhasil diperbarui!');
                onSuccess();
            } else {
                throw new Error(response.data.message || 'Terjadi kesalahan');
            }
        } catch (error) {
            console.error('Error updating business:', error);
            console.error('Error response:', error.response?.data);

            let errorMessage = 'Terjadi kesalahan saat memperbarui data bisnis';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.errors) {
                const errors = Object.values(error.response.data.errors).flat();
                errorMessage = errors.join(', ');
            }

            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (!business) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <BackgroundForm
            title="Edit Data Bisnis"
            subtitle="Perbarui informasi bisnis"
            formData={formData}
            logoPreview={logoPreview || (currentLogo ? `${API_URL}/get-image/${currentLogo}` : null)}
            backgroundPreview={backgroundPreview || (currentBackground ? `${API_URL}/get-image/${currentBackground}` : null)}
            isLoading={isLoading}
            onInputChange={handleInputChange}
            onFileChange={handleFileChange}
            onRemoveLogo={removeLogo}
            onRemoveBackground={removeBackground}
            onSubmit={handleSubmit}
            onBack={onBack}
            submitButtonText="Perbarui Bisnis"
            submitButtonIcon={<Save size={16} />}
            mode="edit"
        />
    );
};

export default BackgroundEdit;