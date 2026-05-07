import { Edit3, MapPin, Clock, Users, Truck, Workflow, Building, Calendar, Laptop, Settings, Eye, Download } from 'lucide-react';
import { useState } from 'react';

const OperationalPlanView = ({ plan, onBack, onEdit }) => {
    const [showWorkflowDiagram, setShowWorkflowDiagram] = useState(true);

    if (!plan) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
        );
    }

    // Helper function untuk mengakses business background
    const getBusinessInfo = () => {
        if (!plan.business_background) {
            return { name: 'Bisnis Tidak Ditemukan', category: 'Tidak ada kategori' };
        }
        return {
            name: plan.business_background.name || 'Bisnis Tidak Ditemukan',
            category: plan.business_background.category || 'Tidak ada kategori'
        };
    };

    const businessInfo = getBusinessInfo();

    const getStatusBadge = (status) => {
        const statusConfig = {
            draft: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300', label: 'Draft' },
            completed: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300', label: 'Selesai' }
        };
        
        const config = statusConfig[status] || statusConfig.draft;
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    // Calculate total employees
    const totalEmployees = plan.employees ? plan.employees.reduce((sum, emp) => sum + (emp.quantity || 0), 0) : 0;

    // Check if workflow diagram exists and has steps
    const hasWorkflowDiagram = plan.workflow_diagram && 
                              plan.workflow_diagram.steps && 
                              plan.workflow_diagram.steps.length > 0;

    // Render Workflow Diagram
    const renderWorkflowDiagram = () => {
        if (!hasWorkflowDiagram) {
            return (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <div className="text-center">
                        <Workflow className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 dark:text-gray-400">Belum ada workflow diagram</p>
                        <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                            Buat diagram di menu edit untuk melihat visualisasi alur kerja
                        </p>
                    </div>
                </div>
            );
        }

        const diagram = plan.workflow_diagram;

        return (
            <div className="space-y-4">
                {/* Diagram Controls */}
                <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                        Workflow Diagram ({diagram.steps.length} steps)
                    </h4>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowWorkflowDiagram(!showWorkflowDiagram)}
                            className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                            <Eye size={14} />
                            {showWorkflowDiagram ? 'Sembunyikan Diagram' : 'Tampilkan Diagram'}
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                            <Download size={14} />
                            Export Diagram
                        </button>
                    </div>
                </div>

                {showWorkflowDiagram && (
                    <div className="space-y-6">
                        {/* Visual Diagram - Vertical Flow */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                            <div className="flex flex-col items-center space-y-4">
                                {diagram.steps.map((step, index) => (
                                    <div key={step.id} className="flex flex-col items-center w-full">
                                        {/* Step Box */}
                                        <div className={`flex items-start gap-4 p-4 rounded-lg border-2 w-full max-w-2xl ${
                                            step.type === 'start' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                                            step.type === 'end' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                                            step.type === 'decision' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                                            step.type === 'preparation' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' :
                                            step.type === 'customer' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' :
                                            'border-gray-500 bg-gray-50 dark:bg-gray-700/50'
                                        }`}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                                step.type === 'start' ? 'bg-green-500 text-white' :
                                                step.type === 'end' ? 'bg-red-500 text-white' :
                                                step.type === 'decision' ? 'bg-yellow-500 text-white' :
                                                step.type === 'preparation' ? 'bg-blue-500 text-white' :
                                                step.type === 'customer' ? 'bg-purple-500 text-white' :
                                                'bg-gray-500 text-white'
                                            }`}>
                                                {step.number}
                                            </div>
                                            <div className="flex-1">
                                                <h5 className="font-medium text-gray-900 dark:text-white mb-1">
                                                    {step.description}
                                                </h5>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                    <span className="capitalize">{step.type}</span>
                                                    {step.role && (
                                                        <>
                                                            <span>•</span>
                                                            <span>Role: {step.role}</span>
                                                        </>
                                                    )}
                                                    {step.duration && (
                                                        <>
                                                            <span>•</span>
                                                            <span>Durasi: {step.duration}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Arrow between steps (vertical) */}
                                        {index < diagram.steps.length - 1 && (
                                            <div className="flex justify-center w-full py-2">
                                                <div className="w-0.5 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Detailed Steps List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {diagram.steps.map((step, index) => (
                                <div key={step.id} className={`p-4 rounded-lg border-l-4 ${
                                    step.type === 'start' ? 'border-l-green-500 bg-green-50 dark:bg-green-900/20' :
                                    step.type === 'end' ? 'border-l-red-500 bg-red-50 dark:bg-red-900/20' :
                                    step.type === 'decision' ? 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                                    step.type === 'preparation' ? 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20' :
                                    step.type === 'customer' ? 'border-l-purple-500 bg-purple-50 dark:bg-purple-900/20' :
                                    'border-l-gray-500 bg-gray-50 dark:bg-gray-700/50'
                                }`}>
                                    <div className="flex items-start gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                            step.type === 'start' ? 'bg-green-500 text-white' :
                                            step.type === 'end' ? 'bg-red-500 text-white' :
                                            step.type === 'decision' ? 'bg-yellow-500 text-white' :
                                            step.type === 'preparation' ? 'bg-blue-500 text-white' :
                                            step.type === 'customer' ? 'bg-purple-500 text-white' :
                                            'bg-gray-500 text-white'
                                        }`}>
                                            {step.number}
                                        </div>
                                        <div className="flex-1">
                                            <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                                                {step.description}
                                            </h5>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Tipe:</span>
                                                    <span className="text-gray-900 dark:text-white capitalize">{step.type}</span>
                                                </div>
                                                {step.role && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600 dark:text-gray-400">Role:</span>
                                                        <span className="text-gray-900 dark:text-white">{step.role}</span>
                                                    </div>
                                                )}
                                                {step.duration && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600 dark:text-gray-400">Durasi:</span>
                                                        <span className="text-gray-900 dark:text-white">{step.duration}</span>
                                                    </div>
                                                )}
                                                {step.resources && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600 dark:text-gray-400">Resources:</span>
                                                        <span className="text-gray-900 dark:text-white">{step.resources}</span>
                                                    </div>
                                                )}
                                            </div>
                                            {index < diagram.steps.length - 1 && (
                                                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        → Langkah selanjutnya: {diagram.steps[index + 1]?.description}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Diagram Summary */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                            <h5 className="font-medium text-gray-900 dark:text-white mb-3">Ringkasan Workflow</h5>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {diagram.steps.length}
                                    </div>
                                    <div className="text-gray-600 dark:text-gray-400">Total Steps</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {diagram.steps.filter(step => step.type === 'start' || step.type === 'process').length}
                                    </div>
                                    <div className="text-gray-600 dark:text-gray-400">Process Steps</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                        {diagram.steps.filter(step => step.type === 'decision').length}
                                    </div>
                                    <div className="text-gray-600 dark:text-gray-400">Decisions</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                        {diagram.steps.filter(step => step.type === 'customer').length}
                                    </div>
                                    <div className="text-gray-600 dark:text-gray-400">Customer Steps</div>
                                </div>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                            <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Keterangan Diagram:</h5>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                <div className="flex items-center gap-2 p-2 rounded bg-white dark:bg-gray-600">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span className="font-medium">Start</span>
                                    <span className="text-gray-500 dark:text-gray-400 ml-auto">Awal proses</span>
                                </div>
                                <div className="flex items-center gap-2 p-2 rounded bg-white dark:bg-gray-600">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <span className="font-medium">End</span>
                                    <span className="text-gray-500 dark:text-gray-400 ml-auto">Akhir proses</span>
                                </div>
                                <div className="flex items-center gap-2 p-2 rounded bg-white dark:bg-gray-600">
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <span className="font-medium">Decision</span>
                                    <span className="text-gray-500 dark:text-gray-400 ml-auto">Keputusan</span>
                                </div>
                                <div className="flex items-center gap-2 p-2 rounded bg-white dark:bg-gray-600">
                                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                    <span className="font-medium">Preparation</span>
                                    <span className="text-gray-500 dark:text-gray-400 ml-auto">Persiapan</span>
                                </div>
                                <div className="flex items-center gap-2 p-2 rounded bg-white dark:bg-gray-600">
                                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                    <span className="font-medium">Customer</span>
                                    <span className="text-gray-500 dark:text-gray-400 ml-auto">Interaksi customer</span>
                                </div>
                                <div className="flex items-center gap-2 p-2 rounded bg-white dark:bg-gray-600">
                                    <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                                    <span className="font-medium">Process</span>
                                    <span className="text-gray-500 dark:text-gray-400 ml-auto">Proses normal</span>
                                </div>
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
                
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Detail Rencana Operasional</h1>
                        <p className="text-gray-600 dark:text-gray-400">Lihat detail lengkap rencana operasional</p>
                    </div>
                    <button
                        onClick={() => onEdit(plan)}
                        className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
                    >
                        <Edit3 size={16} />
                        Edit
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-8">
                
                {/* Header */}
                <div className="flex items-start gap-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex-shrink-0">
                        <div className="w-24 h-24 border-2 border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-700/50">
                            <Workflow className="w-12 h-12 text-gray-400" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {businessInfo.name}
                        </h2>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 px-3 py-1 rounded-full flex items-center gap-1">
                                <Workflow size={14} />
                                Rencana Operasional
                            </span>
                            <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full flex items-center gap-1">
                                <Building size={14} />
                                {businessInfo.category}
                            </span>
                            <span className="bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 px-3 py-1 rounded-full flex items-center gap-1">
                                <Calendar size={14} />
                                Dibuat: {new Date(plan.created_at).toLocaleDateString('id-ID')}
                            </span>
                            {hasWorkflowDiagram && (
                                <span className="bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300 px-3 py-1 rounded-full flex items-center gap-1">
                                    <Workflow size={14} />
                                    Dengan Diagram ({plan.workflow_diagram.steps.length} steps)
                                </span>
                            )}
                            <span className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 px-3 py-1 rounded-full">
                                {getStatusBadge(plan.status)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Workflow Image Display - Di bagian atas */}
                {plan.workflow_image_url && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Workflow size={20} />
                            Gambar Diagram Alur Kerja
                        </h3>
                        <div className="flex justify-center bg-white dark:bg-gray-800 rounded-lg p-4">
                            <img 
                                src={plan.workflow_image_url} 
                                alt="Workflow Diagram" 
                                className="max-h-80 rounded-lg shadow-md"
                            />
                        </div>
                    </div>
                )}

                {/* Workflow Diagram Section - Generated */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Workflow size={20} />
                        Workflow Diagram (Generated)
                        {hasWorkflowDiagram && (
                            <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full text-xs">
                                {plan.workflow_diagram.steps.length} Langkah
                            </span>
                        )}
                    </h3>
                    {renderWorkflowDiagram()}
                </div>

                {/* Lokasi Usaha */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <MapPin size={20} />
                        Lokasi Usaha
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Alamat</h4>
                            <p className="text-gray-900 dark:text-white">{plan.business_location}</p>
                            {plan.location_description && (
                                <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
                                    {plan.location_description}
                                </p>
                            )}
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Detail Lokasi</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Tipe Lokasi:</span>
                                    <span className="text-gray-900 dark:text-white capitalize">{plan.location_type}</span>
                                </div>
                                {plan.location_size && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Luas:</span>
                                        <span className="text-gray-900 dark:text-white">{plan.location_size} m²</span>
                                    </div>
                                )}
                                {plan.rent_cost && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Biaya Sewa:</span>
                                        <span className="text-gray-900 dark:text-white">Rp {parseInt(plan.rent_cost).toLocaleString('id-ID')}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Karyawan - Tabel */}
                {plan.employees && plan.employees.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Users size={20} />
                            Karyawan ({totalEmployees} orang)
                        </h3>
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Posisi
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Jumlah
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Gaji
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Tanggung Jawab
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                    {plan.employees.map((employee, index) => (
                                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {employee.position}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 dark:text-white">
                                                    {employee.quantity} orang
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 dark:text-white">
                                                    {employee.salary ? `Rp ${parseInt(employee.salary).toLocaleString('id-ID')}` : '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 dark:text-white max-w-xs">
                                                    {employee.responsibilities || '-'}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <td colSpan="4" className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                                            Total {plan.employees.length} posisi, {totalEmployees} karyawan
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                )}

                {/* Jam Operasional */}
                {plan.operational_hours && plan.operational_hours.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Clock size={20} />
                            Jam Operasional
                        </h3>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {plan.operational_hours.map((hour, index) => (
                                    <div key={index} className="flex justify-between items-center py-2 border-b border-yellow-200 dark:border-yellow-700 last:border-b-0">
                                        <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">{hour.day}</span>
                                        <span className="text-gray-600 dark:text-gray-400">
                                            {hour.open} - {hour.close}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Supplier & Mitra */}
                {plan.suppliers && plan.suppliers.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Truck size={20} />
                            Supplier & Mitra Bisnis
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {plan.suppliers.map((supplier, index) => (
                                <div key={index} className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">{supplier.name}</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Produk:</span>
                                            <span className="text-gray-900 dark:text-white">{supplier.product}</span>
                                        </div>
                                        {supplier.contact && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Kontak:</span>
                                                <span className="text-gray-900 dark:text-white">{supplier.contact}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Alur Kerja & Teknologi */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Settings size={20} />
                        Alur Kerja & Teknologi
                    </h3>
                    
                    {/* Alur Kerja Harian */}
                    {plan.daily_workflow && (
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900 dark:text-white">Alur Kerja Harian</h4>
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                <p className="text-gray-900 dark:text-white whitespace-pre-line leading-relaxed">
                                    {plan.daily_workflow}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Kebutuhan Peralatan */}
                    {plan.equipment_needs && (
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                <Settings size={16} />
                                Kebutuhan Peralatan
                            </h4>
                            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                                <p className="text-gray-900 dark:text-white whitespace-pre-line">
                                    {plan.equipment_needs}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Teknologi yang Digunakan */}
                    {plan.technology_stack && (
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                <Laptop size={16} />
                                Teknologi yang Digunakan
                            </h4>
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                                <p className="text-gray-900 dark:text-white whitespace-pre-line">
                                    {plan.technology_stack}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons di bagian bawah */}
                <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        type="button"
                        onClick={onBack}
                        className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Kembali
                    </button>
                    <button
                        type="button"
                        onClick={() => onEdit(plan)}
                        className="flex-1 bg-yellow-600 text-white py-3 rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <Edit3 size={16} />
                        Edit Rencana
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OperationalPlanView;