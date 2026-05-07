import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import OperationalPlanForm from './OperationalPlan-Form';
import { operationalPlanApi, backgroundApi } from '../../../services/businessPlan';
import { toast } from 'react-toastify';

const OperationalPlanCreate = ({ onBack, onSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [businesses, setBusinesses] = useState([]);
    const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(true);

    const [formData, setFormData] = useState({
        business_background_id: '',
        business_location: '',
        location_description: '',
        location_type: '',
        location_size: '',
        rent_cost: '',
        daily_workflow: '',
        equipment_needs: '',
        technology_stack: '',
        status: 'draft',
        employees: [],
        operational_hours: [],
        suppliers: [],
        workflow_diagram: null // Pastikan workflow_diagram ada di formData
    });

    // Fetch business backgrounds untuk dropdown
    const fetchBusinesses = async () => {
        try {
            setIsLoadingBusinesses(true);
            const response = await backgroundApi.getAll();
            
            if (response.data.status === 'success') {
                setBusinesses(response.data.data || []);
            } else {
                throw new Error('Failed to fetch business backgrounds');
            }
        } catch (error) {
            console.error('Error fetching businesses:', error);
            toast.error('Gagal memuat data bisnis');
        } finally {
            setIsLoadingBusinesses(false);
        }
    };

    useEffect(() => {
        fetchBusinesses();
    }, []);

    const handleInputChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEmployeesChange = (employees) => {
        setFormData(prev => ({ ...prev, employees }));
    };

    const handleOperationalHoursChange = (operationalHours) => {
        setFormData(prev => ({ ...prev, operational_hours: operationalHours }));
    };

    const handleSuppliersChange = (suppliers) => {
        setFormData(prev => ({ ...prev, suppliers }));
    };

    // Tambahkan handler untuk workflow diagram
    const handleWorkflowDiagramChange = (workflowDiagram) => {
        setFormData(prev => ({ ...prev, workflow_diagram: workflowDiagram }));
    };

    const handleSubmit = async (e, submitData = null) => {
        e.preventDefault();
        
        const dataToSubmit = submitData || formData;

        // Validasi: business background harus dipilih
        if (!dataToSubmit.business_background_id) {
            toast.error('Pilih bisnis terlebih dahulu');
            return;
        }

        // Validasi: lokasi bisnis harus diisi
        if (!dataToSubmit.business_location.trim()) {
            toast.error('Lokasi bisnis wajib diisi');
            return;
        }

        // Validasi: tipe lokasi harus dipilih
        if (!dataToSubmit.location_type) {
            toast.error('Tipe lokasi wajib dipilih');
            return;
        }

        // Validasi: alur kerja harian harus diisi
        if (!dataToSubmit.daily_workflow.trim()) {
            toast.error('Alur kerja harian wajib diisi');
            return;
        }

        setIsLoading(true);

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            
            if (!user || !user.id) {
                throw new Error('User data not found');
            }

            // Extract workflow image jika ada di submitData
            const workflowImageFile = submitData?.workflowImageFile;
            
            const finalData = {
                ...dataToSubmit,
                user_id: user.id
            };

            console.log('Creating operational plan data:', finalData);
            const response = await operationalPlanApi.create(finalData);

            if (response.data.status === 'success') {
                const createdPlanId = response.data.data?.id;
                
                // Upload workflow image jika ada
                if (workflowImageFile && createdPlanId) {
                    try {
                        await operationalPlanApi.uploadWorkflowImage(createdPlanId, workflowImageFile);
                        toast.success('Rencana operasional dan gambar workflow berhasil disimpan!');
                    } catch (uploadError) {
                        console.error('Error uploading workflow image:', uploadError);
                        // Don't fail the whole submission, just show warning
                        toast.warning('Rencana operasional berhasil disimpan, namun gambar workflow gagal diupload');
                    }
                } else {
                    toast.success('Rencana operasional berhasil dibuat!');
                }
                
                onSuccess();
            } else {
                throw new Error(response.data.message || 'Terjadi kesalahan');
            }
        } catch (error) {
            console.error('Error creating operational plan:', error);
            
            let errorMessage = 'Terjadi kesalahan saat membuat rencana operasional';
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

    return (
        <OperationalPlanForm
            title="Buat Rencana Operasional Baru"
            subtitle="Isi informasi rencana operasional dengan workflow diagram"
            formData={formData}
            businesses={businesses}
            isLoadingBusinesses={isLoadingBusinesses}
            isLoading={isLoading}
            onInputChange={handleInputChange}
            onEmployeesChange={handleEmployeesChange}
            onOperationalHoursChange={handleOperationalHoursChange}
            onSuppliersChange={handleSuppliersChange}
            onWorkflowDiagramChange={handleWorkflowDiagramChange}
            onSubmit={handleSubmit}
            onBack={onBack}
            submitButtonText="Simpan Rencana"
            submitButtonIcon={<Save size={16} />}
            mode="create"
        />
    );
};

export default OperationalPlanCreate;