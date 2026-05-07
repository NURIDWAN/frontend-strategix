import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import OperationalPlanForm from './OperationalPlan-Form';
import { operationalPlanApi, backgroundApi } from '../../../services/businessPlan';
import { toast } from 'react-toastify';

const OperationalPlanEdit = ({ plan, onBack, onSuccess }) => {
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
        workflow_diagram: null
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

    useEffect(() => {
        if (plan) {
            console.log('🔍 Loading plan data for edit:', {
                id: plan.id,
                workflow_diagram: plan.workflow_diagram,
                has_diagram: !!plan.workflow_diagram,
                steps_count: plan.workflow_diagram?.steps?.length || 0
            });

            setFormData({
                business_background_id: plan.business_background_id || plan.business_background?.id || '',
                business_location: plan.business_location || '',
                location_description: plan.location_description || '',
                location_type: plan.location_type || '',
                location_size: plan.location_size || '',
                rent_cost: plan.rent_cost || '',
                daily_workflow: plan.daily_workflow || '',
                equipment_needs: plan.equipment_needs || '',
                technology_stack: plan.technology_stack || '',
                status: plan.status || 'draft',
                employees: Array.isArray(plan.employees) ? plan.employees : [],
                operational_hours: Array.isArray(plan.operational_hours) ? plan.operational_hours : [],
                suppliers: Array.isArray(plan.suppliers) ? plan.suppliers : [],
                workflow_diagram: plan.workflow_diagram || null
            });
        }
    }, [plan]);

    const handleInputChange = (name, value) => {
        console.log(`Input changed: ${name} =`, value);
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

    const handleWorkflowDiagramChange = (workflowDiagram) => {
        console.log('🔄 Workflow diagram changed:', workflowDiagram);
        setFormData(prev => ({ 
            ...prev, 
            workflow_diagram: workflowDiagram 
        }));
    };

    const handleSubmit = async (e, submitData = null) => {
        e.preventDefault();
        
        // Gunakan submitData jika ada (dari form), atau formData jika tidak
        const dataToSubmit = submitData || formData;
        const workflowImageFile = submitData?.workflowImageFile;

        // Jika hanya upload gambar (workflow image file ada tapi form tidak submit dengan daily_workflow)
        if (workflowImageFile && (!submitData || !submitData.daily_workflow?.trim())) {
            setIsLoading(true);
            try {
                const uploadResponse = await operationalPlanApi.uploadWorkflowImage(plan.id, workflowImageFile);
                if (uploadResponse.data?.status === 'success') {
                    toast.success('Gambar workflow berhasil diupload!');
                    
                    // Fetch detail plan terbaru untuk mendapatkan workflow_image_url
                    try {
                        const planDetailResponse = await operationalPlanApi.getById(plan.id);
                        if (planDetailResponse.data?.status === 'success') {
                            const updatedPlan = planDetailResponse.data.data;
                            onSuccess(updatedPlan);
                        } else {
                            // Jika fetch detail gagal, gunakan response data dari upload
                            onSuccess(uploadResponse.data?.data || { ...plan, workflow_image_url: uploadResponse.data?.data?.workflow_image_url });
                        }
                    } catch (fetchError) {
                        console.error('Error fetching updated plan:', fetchError);
                        onSuccess(uploadResponse.data?.data || plan);
                    }
                } else {
                    toast.error(uploadResponse.data?.message || 'Gagal mengunggah gambar workflow');
                }
            } catch (uploadError) {
                console.error('Error uploading workflow image:', uploadError);
                const errorMsg = uploadError.response?.data?.errors?.workflow_image?.[0] || 
                                uploadError.response?.data?.message ||
                                'Gagal mengunggah gambar workflow';
                toast.error(errorMsg);
            } finally {
                setIsLoading(false);
            }
            return;
        }
        
        console.log('🚀 Submitting update data:', {
            plan_id: plan.id,
            workflow_diagram: dataToSubmit.workflow_diagram,
            has_diagram: !!dataToSubmit.workflow_diagram,
            steps_count: dataToSubmit.workflow_diagram?.steps?.length || 0,
            all_data: dataToSubmit
        });

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

            // Siapkan data untuk dikirim - pastikan workflow_diagram termasuk
            const finalData = {
                business_background_id: dataToSubmit.business_background_id,
                business_location: dataToSubmit.business_location,
                location_description: dataToSubmit.location_description,
                location_type: dataToSubmit.location_type,
                location_size: dataToSubmit.location_size,
                rent_cost: dataToSubmit.rent_cost,
                daily_workflow: dataToSubmit.daily_workflow,
                equipment_needs: dataToSubmit.equipment_needs,
                technology_stack: dataToSubmit.technology_stack,
                status: dataToSubmit.status,
                employees: dataToSubmit.employees,
                operational_hours: dataToSubmit.operational_hours,
                suppliers: dataToSubmit.suppliers,
                workflow_diagram: dataToSubmit.workflow_diagram,
                user_id: user.id
            };

            console.log('📤 Final data to update:', finalData);

            const response = await operationalPlanApi.update(plan.id, finalData);

            if (response.data.status === 'success') {
                console.log('✅ Update successful:', response.data);
                
                // Upload workflow image jika ada
                if (workflowImageFile) {
                    try {
                        const uploadResponse = await operationalPlanApi.uploadWorkflowImage(plan.id, workflowImageFile);
                        if (uploadResponse.data?.status === 'success') {
                            toast.success('Rencana operasional dan gambar workflow berhasil diperbarui!');
                            
                            // Fetch detail plan terbaru untuk mendapatkan workflow_image_url yang baru
                            try {
                                const planDetailResponse = await operationalPlanApi.getById(plan.id);
                                if (planDetailResponse.data?.status === 'success') {
                                    onSuccess(planDetailResponse.data.data);
                                } else {
                                    onSuccess(response.data.data);
                                }
                            } catch (fetchError) {
                                console.error('Error fetching updated plan:', fetchError);
                                onSuccess(response.data.data);
                            }
                            return;
                        } else {
                            toast.warning('Rencana operasional berhasil diperbarui, namun gambar workflow gagal diupload');
                        }
                    } catch (uploadError) {
                        console.error('Error uploading workflow image:', uploadError);
                        // Don't fail the whole submission
                        toast.warning('Rencana operasional berhasil diperbarui, namun gambar workflow gagal diupload');
                    }
                } else {
                    toast.success('Rencana operasional berhasil diperbarui!');
                }
                
                onSuccess(response.data.data);
            } else {
                throw new Error(response.data.message || 'Terjadi kesalahan');
            }
        } catch (error) {
            console.error('❌ Error updating operational plan:', error);
            
            let errorMessage = 'Terjadi kesalahan saat memperbarui rencana operasional';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.errors) {
                const errors = Object.values(error.response.data.errors).flat();
                errorMessage = errors.join(', ');
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (!plan) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <OperationalPlanForm
            title="Edit Rencana Operasional"
            subtitle="Perbarui informasi rencana operasional"
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
            submitButtonText="Perbarui Rencana"
            submitButtonIcon={<Save size={16} />}
            mode="edit"
            existingPlan={plan}
        />
    );
};

export default OperationalPlanEdit;