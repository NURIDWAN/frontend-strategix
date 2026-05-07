import { useState, useEffect } from 'react';
import { Building, Loader, Plus, Trash2, Clock, Users, Truck, Workflow, Eye, Download, RefreshCw, Upload, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { operationalPlanApi } from '../../../services/businessPlan';

const OperationalPlanForm = ({
    title,
    subtitle,
    formData,
    businesses,
    isLoadingBusinesses,
    isLoading,
    onInputChange,
    onEmployeesChange,
    onOperationalHoursChange,
    onSuppliersChange,
    onSubmit,
    onBack,
    submitButtonText,
    submitButtonIcon,
    mode = 'create',
    existingPlan
}) => {
    const [errors, setErrors] = useState({});
    const [showWorkflowPreview, setShowWorkflowPreview] = useState(false);
    const [isGeneratingDiagram, setIsGeneratingDiagram] = useState(false);
    const [workflowDiagram, setWorkflowDiagram] = useState(null);
    const [workflowImageFile, setWorkflowImageFile] = useState(null);
    const [workflowImagePreview, setWorkflowImagePreview] = useState(null);
    const [isUploadingWorkflowImage, setIsUploadingWorkflowImage] = useState(false);

    // Load existing workflow diagram dan image jika mode edit
    useEffect(() => {
        if (mode === 'edit' && existingPlan) {
            if (existingPlan?.workflow_diagram) {
                setWorkflowDiagram(existingPlan.workflow_diagram);
            }
            // Update workflow image preview setiap kali existingPlan berubah
            if (existingPlan?.workflow_image_url) {
                setWorkflowImagePreview(existingPlan.workflow_image_url);
            } else {
                // Clear preview jika tidak ada image
                setWorkflowImagePreview(null);
            }
        }
    }, [mode, existingPlan?.id, existingPlan?.workflow_diagram, existingPlan?.workflow_image_url]);

    const validateField = (name, value) => {
        const newErrors = { ...errors };
        
        if (name === 'business_location' && !value.trim()) {
            newErrors.business_location = 'Lokasi bisnis wajib diisi';
        } else if (name === 'business_location') {
            delete newErrors.business_location;
        }

        if (name === 'location_type' && !value) {
            newErrors.location_type = 'Tipe lokasi wajib dipilih';
        } else if (name === 'location_type') {
            delete newErrors.location_type;
        }

        if (name === 'daily_workflow' && !value.trim()) {
            newErrors.daily_workflow = 'Alur kerja harian wajib diisi';
        } else if (name === 'daily_workflow') {
            delete newErrors.daily_workflow;
        }

        setErrors(newErrors);
    };

    const handleInputChangeWrapper = (name, value) => {
        onInputChange(name, value);
        validateField(name, value);
        
        // Reset workflow diagram jika daily_workflow berubah
        if (name === 'daily_workflow' && workflowDiagram) {
            setWorkflowDiagram(null);
            toast.info('Workflow diagram perlu digenerate ulang');
        }
    };

    // Generate Workflow Diagram dengan API
    const generateWorkflowDiagram = async () => {
        if (!formData.daily_workflow.trim()) {
            toast.error('Deskripsi alur kerja harian harus diisi terlebih dahulu');
            return;
        }

        setIsGeneratingDiagram(true);
        try {
            if (mode === 'edit' && existingPlan?.id) {
                // Untuk mode edit, gunakan API generate
                const response = await operationalPlanApi.generateWorkflowDiagram(existingPlan.id);
                if (response.data.status === 'success') {
                    setWorkflowDiagram(response.data.data.workflow_diagram);
                    toast.success('Workflow diagram berhasil digenerate!');
                } else {
                    throw new Error(response.data.message || 'Failed to generate diagram');
                }
            } else {
                // Untuk mode create, generate secara manual
                const simulatedDiagram = generateDiagramFromText(formData.daily_workflow);
                setWorkflowDiagram(simulatedDiagram);
                toast.success('Workflow diagram berhasil digenerate!');
            }
        } catch (error) {
            console.error('Error generating workflow diagram:', error);
            
            // Fallback: generate secara manual
            try {
                const simulatedDiagram = generateDiagramFromText(formData.daily_workflow);
                setWorkflowDiagram(simulatedDiagram);
                toast.success('Workflow diagram berhasil digenerate (offline mode)!');
            } catch (fallbackError) {
                toast.error('Gagal generate workflow diagram');
            }
        } finally {
            setIsGeneratingDiagram(false);
        }
    };

    // Fungsi untuk generate diagram dari text
    const generateDiagramFromText = (workflowText) => {
        const lines = workflowText.split('\n').filter(line => line.trim());
        const steps = [];
        
        lines.forEach((line, index) => {
            const cleanLine = line.replace(/^\d+[\.\)]\s*/, '').replace(/^[*-]\s*/, '').trim();
            if (cleanLine) {
                steps.push({
                    id: `step_${index + 1}`,
                    number: index + 1,
                    description: cleanLine,
                    type: detectStepType(cleanLine)
                });
            }
        });

        const nodes = steps.map(step => ({
            id: step.id,
            label: step.description,
            type: step.type,
            shape: getNodeShape(step.type)
        }));

        const edges = steps.slice(0, -1).map((step, index) => ({
            from: step.id,
            to: steps[index + 1].id,
            label: 'Lanjut'
        }));

        return {
            steps,
            nodes,
            edges,
            generated_at: new Date().toISOString()
        };
    };

    // Handler untuk file upload workflow image
    const handleWorkflowImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validasi file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
            if (!allowedTypes.includes(file.type)) {
                toast.error('Format file tidak didukung. Gunakan JPG, PNG, GIF, atau SVG.');
                return;
            }

            // Validasi file size (max 2MB)
            const maxSize = 2 * 1024 * 1024; // 2MB
            if (file.size > maxSize) {
                toast.error('Ukuran file terlalu besar. Maksimal 2MB.');
                return;
            }

            setWorkflowImageFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (event) => {
                setWorkflowImagePreview(event.target?.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handler untuk clear workflow image
    const handleClearWorkflowImage = () => {
        setWorkflowImageFile(null);
        setWorkflowImagePreview(null);
        // Clear file input
        const fileInput = document.getElementById('workflow-image-input');
        if (fileInput) fileInput.value = '';
    };

    // Handler untuk upload workflow image
    const handleUploadWorkflowImage = async () => {
        if (!workflowImageFile || !existingPlan?.id) {
            toast.error('Pilih gambar dan rencana operasional terlebih dahulu.');
            return;
        }

        setIsUploadingWorkflowImage(true);
        try {
            const response = await operationalPlanApi.uploadWorkflowImage(
                existingPlan.id,
                workflowImageFile
            );

            if (response.data?.status === 'success') {
                toast.success('Gambar workflow berhasil diunggah!');
                setWorkflowImageFile(null);
                // Keep preview showing the uploaded image
                if (response.data?.data?.workflow_image_url) {
                    setWorkflowImagePreview(response.data.data.workflow_image_url);
                }
            } else {
                toast.error(response.data?.message || 'Gagal mengunggah gambar workflow');
            }
        } catch (error) {
            console.error('Error uploading workflow image:', error);
            const errorMsg = error.response?.data?.errors?.workflow_image?.[0] ||
                            error.response?.data?.message ||
                            'Gagal mengunggah gambar workflow';
            toast.error(errorMsg);
        } finally {
            setIsUploadingWorkflowImage(false);
        }
    };

    const detectStepType = (description) => {
        const desc = description.toLowerCase();
        if (desc.includes('buka') || desc.includes('mulai') || desc.includes('start')) return 'start';
        if (desc.includes('tutup') || desc.includes('selesai') || desc.includes('end')) return 'end';
        if (desc.includes('persiapan') || desc.includes('siap')) return 'preparation';
        if (desc.includes('cek') || desc.includes('periksa') || desc.includes('verifikasi')) return 'decision';
        if (desc.includes('pelanggan') || desc.includes('customer') || desc.includes('pembeli')) return 'customer';
        if (desc.includes('laporan') || desc.includes('report') || desc.includes('catat')) return 'document';
        return 'process';
    };

    const getNodeShape = (type) => {
        const shapes = {
            'start': 'circle',
            'end': 'circle',
            'process': 'rect',
            'decision': 'diamond',
            'preparation': 'round-rect',
            'customer': 'stadium',
            'document': 'document'
        };
        return shapes[type] || 'rect';
    };

    // Render Visual Diagram dengan CSS
    const renderVisualDiagram = () => {
        if (!workflowDiagram || !workflowDiagram.nodes) return null;

        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Diagram Visual Workflow</h4>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {workflowDiagram.nodes.length} steps
                    </span>
                </div>
                
                <div className="relative">
                    {/* Container untuk diagram */}
                    <div className="flex flex-col items-center space-y-6 py-4">
                        {workflowDiagram.nodes.map((node, index) => (
                            <div key={node.id} className="flex flex-col items-center w-full">
                                {/* Node */}
                                <div className={`
                                    relative px-4 py-3 rounded-lg border-2 min-w-[200px] text-center
                                    ${getNodeStyles(node.type)}
                                `}>
                                    <div className="flex items-center justify-center space-x-2">
                                        <span className="text-xs font-bold bg-white dark:bg-gray-800 rounded-full w-5 h-5 flex items-center justify-center">
                                            {index + 1}
                                        </span>
                                        <span className="text-sm font-medium">{node.label}</span>
                                    </div>
                                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                                        <span className={`
                                            text-xs px-2 py-1 rounded-full capitalize
                                            ${getBadgeStyles(node.type)}
                                        `}>
                                            {node.type}
                                        </span>
                                    </div>
                                </div>

                                {/* Arrow connector (kecuali untuk node terakhir) */}
                                {index < workflowDiagram.nodes.length - 1 && (
                                    <div className="flex flex-col items-center mt-2">
                                        <div className="w-0.5 h-6 bg-gray-300 dark:bg-gray-600"></div>
                                        <div className="flex items-center text-gray-400 dark:text-gray-500 mt-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                            </svg>
                                            <span className="text-xs ml-1">Lanjut</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Legend */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Keterangan:</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-green-600"></div>
                            <span>Start</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-red-600"></div>
                            <span>End</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-yellow-500 border-2 border-yellow-600 transform rotate-45"></div>
                            <span>Decision</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-blue-500 border-2 border-blue-600 rounded"></div>
                            <span>Process</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Helper functions untuk styling
    const getNodeStyles = (type) => {
        const styles = {
            'start': 'bg-green-100 border-green-500 text-green-800 dark:bg-green-900/20 dark:border-green-400 dark:text-green-300',
            'end': 'bg-red-100 border-red-500 text-red-800 dark:bg-red-900/20 dark:border-red-400 dark:text-red-300',
            'process': 'bg-blue-100 border-blue-500 text-blue-800 dark:bg-blue-900/20 dark:border-blue-400 dark:text-blue-300',
            'decision': 'bg-yellow-100 border-yellow-500 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-400 dark:text-yellow-300',
            'preparation': 'bg-purple-100 border-purple-500 text-purple-800 dark:bg-purple-900/20 dark:border-purple-400 dark:text-purple-300',
            'customer': 'bg-indigo-100 border-indigo-500 text-indigo-800 dark:bg-indigo-900/20 dark:border-indigo-400 dark:text-indigo-300',
            'document': 'bg-gray-100 border-gray-500 text-gray-800 dark:bg-gray-900/20 dark:border-gray-400 dark:text-gray-300'
        };
        return styles[type] || styles.process;
    };

    const getBadgeStyles = (type) => {
        const styles = {
            'start': 'bg-green-500 text-white',
            'end': 'bg-red-500 text-white',
            'process': 'bg-blue-500 text-white',
            'decision': 'bg-yellow-500 text-black',
            'preparation': 'bg-purple-500 text-white',
            'customer': 'bg-indigo-500 text-white',
            'document': 'bg-gray-500 text-white'
        };
        return styles[type] || styles.process;
    };

    // Employee Functions
    const addEmployee = () => {
        const newEmployees = [...formData.employees, { position: '', quantity: 1, salary: '', responsibilities: '' }];
        onEmployeesChange(newEmployees);
    };

    const updateEmployee = (index, field, value) => {
        const newEmployees = [...formData.employees];
        newEmployees[index][field] = value;
        onEmployeesChange(newEmployees);
    };

    const removeEmployee = (index) => {
        const newEmployees = formData.employees.filter((_, i) => i !== index);
        onEmployeesChange(newEmployees);
    };

    // Operational Hours Functions
    const addOperationalHour = () => {
        const newHours = [...formData.operational_hours, { day: '', open: '09:00', close: '17:00' }];
        onOperationalHoursChange(newHours);
    };

    const updateOperationalHour = (index, field, value) => {
        const newHours = [...formData.operational_hours];
        newHours[index][field] = value;
        onOperationalHoursChange(newHours);
    };

    const removeOperationalHour = (index) => {
        const newHours = formData.operational_hours.filter((_, i) => i !== index);
        onOperationalHoursChange(newHours);
    };

    // Supplier Functions
    const addSupplier = () => {
        const newSuppliers = [...formData.suppliers, { name: '', product: '', contact: '' }];
        onSuppliersChange(newSuppliers);
    };

    const updateSupplier = (index, field, value) => {
        const newSuppliers = [...formData.suppliers];
        newSuppliers[index][field] = value;
        onSuppliersChange(newSuppliers);
    };

    const removeSupplier = (index) => {
        const newSuppliers = formData.suppliers.filter((_, i) => i !== index);
        onSuppliersChange(newSuppliers);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Final validation
        const finalErrors = {};
        if (!formData.business_location.trim()) finalErrors.business_location = 'Lokasi bisnis wajib diisi';
        if (!formData.location_type) finalErrors.location_type = 'Tipe lokasi wajib dipilih';
        if (!formData.daily_workflow.trim()) finalErrors.daily_workflow = 'Alur kerja harian wajib diisi';

        if (Object.keys(finalErrors).length > 0) {
            setErrors(finalErrors);
            toast.error('Harap lengkapi semua field yang wajib diisi');
            return;
        }

        // Sertakan workflow diagram dalam data yang dikirim
        const submitData = {
            ...formData,
            workflow_diagram: workflowDiagram,
            workflowImageFile: workflowImageFile // Pass file ke parent
        };

        onSubmit(e, submitData);
    };

    // Render Workflow Diagram Preview
    const renderWorkflowPreview = () => {
        if (!workflowDiagram) return null;

        return (
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Preview Workflow Diagram</h4>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setShowWorkflowPreview(!showWorkflowPreview)}
                            className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            <Eye size={14} />
                            {showWorkflowPreview ? 'Sembunyikan' : 'Tampilkan'}
                        </button>
                        <button
                            type="button"
                            onClick={generateWorkflowDiagram}
                            className="flex items-center gap-2 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                            disabled={isGeneratingDiagram}
                        >
                            <RefreshCw size={14} className={isGeneratingDiagram ? 'animate-spin' : ''} />
                            Regenerate
                        </button>
                    </div>
                </div>

                {showWorkflowPreview && (
                    <div className="space-y-4">
                        {/* Visual Diagram */}
                        {renderVisualDiagram()}

                        {/* Steps List */}
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                            <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Detail Steps:</h5>
                            <div className="space-y-2">
                                {workflowDiagram.steps.map((step, index) => (
                                    <div key={step.id} className="flex items-center space-x-3 p-2 bg-white dark:bg-gray-800 rounded border">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getBadgeStyles(step.type)}`}>
                                            {step.number}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-900 dark:text-white">{step.description}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{step.type}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header Section dengan tombol back di atas */}
            <div className="mb-2">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Kembali
                </button>
                
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
                    <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
                    
                    {/* Pilih Bisnis */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Pilih Bisnis *
                        </label>
                        {isLoadingBusinesses ? (
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                <Loader className="animate-spin h-4 w-4" />
                                <span>Memuat data bisnis...</span>
                            </div>
                        ) : businesses.length === 0 ? (
                            <div className="text-center py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                                <Building className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    Belum ada data bisnis. Silakan buat latar belakang bisnis terlebih dahulu.
                                </p>
                            </div>
                        ) : (
                            <select
                                name="business_background_id"
                                value={formData.business_background_id}
                                onChange={(e) => handleInputChangeWrapper('business_background_id', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                required
                            >
                                <option value="">Pilih Bisnis</option>
                                {businesses.map((business) => (
                                    <option key={business.id} value={business.id}>
                                        {business.name} - {business.category}
                                    </option>
                                ))}
                            </select>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Pilih bisnis untuk rencana operasional
                        </p>
                    </div>

                    {/* Lokasi Usaha */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Lokasi Bisnis *
                            </label>
                            <input
                                type="text"
                                name="business_location"
                                value={formData.business_location}
                                onChange={(e) => handleInputChangeWrapper('business_location', e.target.value)}
                                placeholder="Alamat lengkap usaha"
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                                    errors.business_location ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                            />
                            {errors.business_location && (
                                <p className="text-red-500 text-sm mt-1">{errors.business_location}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Tipe Lokasi *
                            </label>
                            <select
                                name="location_type"
                                value={formData.location_type}
                                onChange={(e) => handleInputChangeWrapper('location_type', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                                    errors.location_type ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                            >
                                <option value="">Pilih Tipe Lokasi</option>
                                <option value="owned">Milik Sendiri</option>
                                <option value="rented">Sewa</option>
                                <option value="virtual">Virtual/Online</option>
                                <option value="franchise">Waralaba</option>
                            </select>
                            {errors.location_type && (
                                <p className="text-red-500 text-sm mt-1">{errors.location_type}</p>
                            )}
                        </div>
                    </div>

                    {/* Deskripsi Lokasi */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Deskripsi Lokasi
                        </label>
                        <textarea
                            name="location_description"
                            value={formData.location_description}
                            onChange={(e) => handleInputChangeWrapper('location_description', e.target.value)}
                            rows={3}
                            style={{ resize: 'both' }}
                            placeholder="Deskripsi detail tentang lokasi usaha..."
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    {/* Luas dan Biaya Sewa */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Luas Lokasi (m²)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                name="location_size"
                                value={formData.location_size}
                                onChange={(e) => handleInputChangeWrapper('location_size', e.target.value)}
                                placeholder="0.00"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Biaya Sewa (Rp)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                name="rent_cost"
                                value={formData.rent_cost}
                                onChange={(e) => handleInputChangeWrapper('rent_cost', e.target.value)}
                                placeholder="0"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Karyawan */}
                    <div className="border-t pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                <Users size={20} />
                                Karyawan
                            </h3>
                            <button
                                type="button"
                                onClick={addEmployee}
                                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                                <Plus size={16} />
                                <span>Tambah Posisi</span>
                            </button>
                        </div>

                        {formData.employees.map((employee, index) => (
                            <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 mb-4 bg-gray-50 dark:bg-gray-700/50">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-medium text-gray-700 dark:text-gray-300">Posisi #{index + 1}</h4>
                                    <button
                                        type="button"
                                        onClick={() => removeEmployee(index)}
                                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Posisi/Jabatan
                                        </label>
                                        <input
                                            type="text"
                                            value={employee.position}
                                            onChange={(e) => updateEmployee(index, 'position', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:text-white"
                                            placeholder="Contoh: Manager, Kasir, dll"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Jumlah
                                        </label>
                                        <input
                                            type="number"
                                            value={employee.quantity}
                                            onChange={(e) => updateEmployee(index, 'quantity', parseInt(e.target.value) || 1)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:text-white"
                                            min="1"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Gaji (Rp)
                                        </label>
                                        <input
                                            type="number"
                                            value={employee.salary}
                                            onChange={(e) => updateEmployee(index, 'salary', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:text-white"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Tanggung Jawab
                                    </label>
                                    <textarea
                                        value={employee.responsibilities}
                                        onChange={(e) => updateEmployee(index, 'responsibilities', e.target.value)}
                                        rows={2}
                                        style={{ resize: 'both' }}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:text-white"
                                        placeholder="Deskripsi tanggung jawab..."
                                    />
                                </div>
                            </div>
                        ))}

                        {formData.employees.length === 0 && (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-4">Belum ada data karyawan</p>
                        )}
                    </div>

                    {/* Jam Operasional */}
                    <div className="border-t pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                <Clock size={20} />
                                Jam Operasional
                            </h3>
                            <button
                                type="button"
                                onClick={addOperationalHour}
                                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                                <Plus size={16} />
                                <span>Tambah Hari</span>
                            </button>
                        </div>

                        {formData.operational_hours.map((hour, index) => (
                            <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 mb-4 bg-gray-50 dark:bg-gray-700/50">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-medium text-gray-700 dark:text-gray-300">Hari #{index + 1}</h4>
                                    <button
                                        type="button"
                                        onClick={() => removeOperationalHour(index)}
                                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Hari
                                        </label>
                                        <select
                                            value={hour.day}
                                            onChange={(e) => updateOperationalHour(index, 'day', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:text-white"
                                        >
                                            <option value="">Pilih Hari</option>
                                            <option value="senin">Senin</option>
                                            <option value="selasa">Selasa</option>
                                            <option value="rabu">Rabu</option>
                                            <option value="kamis">Kamis</option>
                                            <option value="jumat">Jumat</option>
                                            <option value="sabtu">Sabtu</option>
                                            <option value="minggu">Minggu</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Buka
                                        </label>
                                        <input
                                            type="time"
                                            value={hour.open}
                                            onChange={(e) => updateOperationalHour(index, 'open', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Tutup
                                        </label>
                                        <input
                                            type="time"
                                            value={hour.close}
                                            onChange={(e) => updateOperationalHour(index, 'close', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {formData.operational_hours.length === 0 && (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-4">Belum ada data jam operasional</p>
                        )}
                    </div>

                    {/* Supplier & Mitra Bisnis */}
                    <div className="border-t pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                <Truck size={20} />
                                Supplier & Mitra Bisnis
                            </h3>
                            <button
                                type="button"
                                onClick={addSupplier}
                                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                                <Plus size={16} />
                                <span>Tambah Supplier</span>
                            </button>
                        </div>

                        {formData.suppliers.map((supplier, index) => (
                            <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 mb-4 bg-gray-50 dark:bg-gray-700/50">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-medium text-gray-700 dark:text-gray-300">Supplier #{index + 1}</h4>
                                    <button
                                        type="button"
                                        onClick={() => removeSupplier(index)}
                                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Nama Supplier
                                        </label>
                                        <input
                                            type="text"
                                            value={supplier.name}
                                            onChange={(e) => updateSupplier(index, 'name', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:text-white"
                                            placeholder="Nama perusahaan supplier"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Produk/Layanan
                                        </label>
                                        <input
                                            type="text"
                                            value={supplier.product}
                                            onChange={(e) => updateSupplier(index, 'product', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:text-white"
                                            placeholder="Produk yang disuplai"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Kontak
                                        </label>
                                        <input
                                            type="text"
                                            value={supplier.contact}
                                            onChange={(e) => updateSupplier(index, 'contact', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:text-white"
                                            placeholder="Email/Telepon"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {formData.suppliers.length === 0 && (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-4">Belum ada data supplier</p>
                        )}
                    </div>

                    {/* Alur Kerja & Workflow Diagram */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Alur Kerja & Diagram</h3>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Alur Kerja Harian *
                            </label>
                            <textarea
                                name="daily_workflow"
                                value={formData.daily_workflow}
                                onChange={(e) => handleInputChangeWrapper('daily_workflow', e.target.value)}
                                rows={4}
                                style={{ resize: 'both' }}
                                placeholder="Deskripsi alur kerja harian dari buka hingga tutup...
Contoh:
1. Persiapan buka toko
2. Cek stok barang
3. Bersih-bersih area
4. Buka toko
5. Layani pelanggan
6. Proses transaksi
7. Cek inventaris
8. Tutup toko"
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                                    errors.daily_workflow ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                            />
                            {errors.daily_workflow && (
                                <p className="text-red-500 text-sm mt-1">{errors.daily_workflow}</p>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Gunakan format list dengan angka atau bullet points untuk hasil diagram yang optimal
                            </p>
                        </div>

                        {/* Workflow Diagram Generator */}
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="font-medium text-gray-700 dark:text-gray-300">
                                    Workflow Diagram Generator
                                </h4>
                                <button
                                    type="button"
                                    onClick={generateWorkflowDiagram}
                                    disabled={isGeneratingDiagram || !formData.daily_workflow.trim()}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Workflow size={16} className={isGeneratingDiagram ? 'animate-spin' : ''} />
                                    {isGeneratingDiagram ? 'Generating...' : 'Generate Diagram'}
                                </button>
                            </div>
                            
                            {!workflowDiagram && (
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                                    <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                                        Klik "Generate Diagram" untuk membuat visual workflow otomatis dari deskripsi alur kerja di atas.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Upload Workflow Image - Hanya tampilkan jika belum ada gambar atau sedang upload */}
                        {!workflowImagePreview && !existingPlan?.workflow_image_url && (
                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-medium text-gray-700 dark:text-gray-300">
                                        Upload Gambar Diagram (Opsional)
                                    </h4>
                                </div>
                                
                                {/* File Input */}
                                <div className="mb-3">
                                    <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                                        <div className="flex flex-col items-center justify-center">
                                            <Upload size={20} className="text-gray-400 mb-1" />
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                Klik untuk upload atau drag & drop
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                JPG, PNG, GIF, SVG (Max 2MB)
                                            </span>
                                        </div>
                                        <input
                                            id="workflow-image-input"
                                            type="file"
                                            accept="image/jpeg,image/png,image/gif,image/svg+xml"
                                            onChange={handleWorkflowImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Preview & Actions - Tampilkan jika ada preview atau sudah ada gambar */}
                        {(workflowImagePreview || existingPlan?.workflow_image_url) && (
                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-medium text-gray-700 dark:text-gray-300">
                                        Gambar Diagram Alur Kerja
                                    </h4>
                                    {!workflowImageFile && existingPlan?.workflow_image_url && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setWorkflowImageFile(null);
                                                setWorkflowImagePreview(null);
                                                const fileInput = document.getElementById('workflow-image-input-replace');
                                                if (fileInput) fileInput.click();
                                            }}
                                            className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                                        >
                                            Ganti Gambar
                                        </button>
                                    )}
                                </div>
                                
                                <div className="relative bg-gray-100 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                                    <img
                                        src={workflowImagePreview || existingPlan?.workflow_image_url}
                                        alt="Workflow Diagram"
                                        className="max-h-48 mx-auto rounded"
                                    />
                                    {workflowImageFile && (
                                        <button
                                            type="button"
                                            onClick={handleClearWorkflowImage}
                                            disabled={isUploadingWorkflowImage}
                                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>

                                {/* Upload Button (hanya untuk file baru di mode edit) */}
                                {workflowImageFile && mode === 'edit' && existingPlan?.id && (
                                    <button
                                        type="button"
                                        onClick={handleUploadWorkflowImage}
                                        disabled={isUploadingWorkflowImage}
                                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                                    >
                                        {isUploadingWorkflowImage ? (
                                            <>
                                                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={16} />
                                                Upload Gambar
                                            </>
                                        )}
                                    </button>
                                )}

                                {/* Info: For new plans, image will be uploaded with form submission */}
                                {workflowImageFile && mode === 'create' && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mt-2">
                                        <p className="text-blue-800 dark:text-blue-300 text-xs">
                                            Gambar akan diupload saat Anda menyimpan rencana operasional.
                                        </p>
                                    </div>
                                )}

                                {/* Hidden file input untuk "Ganti Gambar" button */}
                                <input
                                    id="workflow-image-input-replace"
                                    type="file"
                                    accept="image/jpeg,image/png,image/gif,image/svg+xml"
                                    onChange={handleWorkflowImageChange}
                                    className="hidden"
                                />
                            </div>
                        )}

                        {/* Workflow Diagram Preview */}
                        {renderWorkflowPreview()}
                    </div>

                    {/* Equipment & Technology */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Peralatan & Teknologi</h3>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Kebutuhan Peralatan
                            </label>
                            <textarea
                                name="equipment_needs"
                                value={formData.equipment_needs}
                                onChange={(e) => handleInputChangeWrapper('equipment_needs', e.target.value)}
                                rows={3}
                                style={{ resize: 'both' }}
                                placeholder="Daftar peralatan yang dibutuhkan..."
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Teknologi yang Digunakan
                            </label>
                            <textarea
                                name="technology_stack"
                                value={formData.technology_stack}
                                onChange={(e) => handleInputChangeWrapper('technology_stack', e.target.value)}
                                rows={3}
                                style={{ resize: 'both' }}
                                placeholder="Software, hardware, sistem yang digunakan..."
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Status</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Status Rencana
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={(e) => handleInputChangeWrapper('status', e.target.value)}
                                className="w-full md:w-1/3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            >
                                <option value="draft">Draft</option>
                                <option value="completed">Selesai</option>
                            </select>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onBack}
                            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || isLoadingBusinesses || businesses.length === 0}
                            className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    {submitButtonIcon}
                                    {submitButtonText}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default OperationalPlanForm;