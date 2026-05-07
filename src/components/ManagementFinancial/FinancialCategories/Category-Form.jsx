import { Save, Circle, Folder } from 'lucide-react'; // ← TAMBAH Folder DI SINI

const CategoryForm = ({
    title,
    subtitle,
    formData,
    isLoading,
    onInputChange,
    onSelectChange,
    onSubmit,
    onBack,
    submitButtonText,
    submitButtonIcon,
    mode = 'create'
}) => {
    const colorOptions = [
        { value: '#10B981', label: 'Hijau', color: '#10B981' },
        { value: '#EF4444', label: 'Merah', color: '#EF4444' },
        { value: '#3B82F6', label: 'Biru', color: '#3B82F6' },
        { value: '#8B5CF6', label: 'Ungu', color: '#8B5CF6' },
        { value: '#F59E0B', label: 'Kuning', color: '#F59E0B' },
        { value: '#EC4899', label: 'Pink', color: '#EC4899' },
        { value: '#6B7280', label: 'Abu', color: '#6B7280' },
        { value: '#059669', label: 'Emerald', color: '#059669' },
        { value: '#DC2626', label: 'Merah Tua', color: '#DC2626' },
        { value: '#2563EB', label: 'Biru Tua', color: '#2563EB' },
    ];

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
                    Back
                </button>

                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
                    <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
                </div>
            </div>

            <form onSubmit={onSubmit}>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">

                    {/* Nama Kategori */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nama Kategori *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={onInputChange}
                            placeholder="Contoh: Gaji Bulanan, Biaya Operasional, dll."
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            required
                        />
                    </div>

                    {/* Jenis Kategori dan Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Jenis Kategori *
                            </label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={onSelectChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                required
                            >
                                <option value="">Pilih Jenis</option>
                                <option value="income">Pendapatan</option>
                                <option value="expense">Pengeluaran</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Status Kategori *
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={onSelectChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                required
                            >
                                <option value="">Pilih Status</option>
                                <option value="actual">Aktual</option>
                                <option value="plan">Rencana</option>
                            </select>
                        </div>
                    </div>

                    {/* Sub-Tipe Kategori */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Sub-Tipe Kategori *
                        </label>
                        <select
                            name="category_subtype"
                            value={formData.category_subtype}
                            onChange={onSelectChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            required
                        >
                            {formData.type === 'income' ? (
                                <>
                                    <option value="operating_revenue">Pendapatan Operasional</option>
                                    <option value="non_operating_revenue">Pendapatan Lain-lain</option>
                                </>
                            ) : formData.type === 'expense' ? (
                                <>
                                    <option value="operating_expense">Beban Operasional</option>
                                    <option value="cogs">HPP / COGS</option>
                                    <option value="interest_expense">Beban Bunga</option>
                                    <option value="tax_expense">Pajak Penghasilan</option>
                                </>
                            ) : (
                                <option value="other">Lainnya</option>
                            )}
                        </select>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formData.type === 'income' && 'Pilih jenis pendapatan untuk laporan keuangan yang akurat'}
                            {formData.type === 'expense' && 'Pilih jenis beban untuk perhitungan HPP, Bunga, dan Pajak'}
                            {!formData.type && 'Pilih jenis kategori terlebih dahulu'}
                        </p>
                    </div>

                    {/* Warna Kategori */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Warna Kategori
                        </label>
                        <div className="grid grid-cols-5 gap-3">
                            {colorOptions.map((color) => (
                                <label key={color.value} className="relative cursor-pointer">
                                    <input
                                        type="radio"
                                        name="color"
                                        value={color.value}
                                        checked={formData.color === color.value}
                                        onChange={onInputChange}
                                        className="sr-only"
                                    />
                                    <div className={`
                                        w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all
                                        ${formData.color === color.value
                                            ? 'border-gray-900 dark:border-white scale-110'
                                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                        }
                                    `}
                                    style={{ backgroundColor: color.value }}>
                                        {formData.color === color.value && (
                                            <Circle size={16} className="text-white" fill="white" />
                                        )}
                                    </div>
                                    <span className="block text-xs text-center mt-1 text-gray-600 dark:text-gray-400">
                                        {color.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Deskripsi */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Deskripsi
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={onInputChange}
                            rows={3}
                            placeholder="Deskripsi singkat tentang kategori ini..."
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    {/* Preview */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Preview Kategori</h4>
                        <div className="flex items-center gap-3">
                            <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center border"
                                style={{
                                    backgroundColor: `${formData.color || '#6B7280'}20`,
                                    borderColor: formData.color || '#6B7280'
                                }}
                            >
                                {formData.type === 'income' ? (
                                    <svg className="w-6 h-6" style={{ color: formData.color || '#6B7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                ) : formData.type === 'expense' ? (
                                    <svg className="w-6 h-6" style={{ color: formData.color || '#6B7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                                    </svg>
                                ) : (
                                    <Folder size={20} style={{ color: formData.color || '#6B7280' }} /> // ← INI YANG ERROR
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {formData.name || 'Nama Kategori'}
                                    </span>
                                    {formData.type && (
                                        <span className={`
                                            px-2 py-1 rounded-full text-xs font-medium
                                            ${formData.type === 'income'
                                                ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                                                : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                                            }
                                        `}>
                                            {formData.type === 'income' ? 'Pendapatan' : 'Pengeluaran'}
                                        </span>
                                    )}
                                    {formData.status && (
                                        <span className={`
                                            px-2 py-1 rounded-full text-xs font-medium
                                            ${formData.status === 'actual'
                                                ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
                                                : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
                                            }
                                        `}>
                                            {formData.status === 'actual' ? 'Aktual' : 'Rencana'}
                                        </span>
                                    )}
                                    {formData.category_subtype && formData.category_subtype !== 'other' && (
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300">
                                            {{
                                                'operating_revenue': 'Operasional',
                                                'non_operating_revenue': 'Non-Operasional',
                                                'cogs': 'HPP',
                                                'operating_expense': 'Operasional',
                                                'interest_expense': 'Bunga',
                                                'tax_expense': 'Pajak'
                                            }[formData.category_subtype] || formData.category_subtype}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {formData.description || 'Deskripsi kategori...'}
                                </p>
                            </div>
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
                            disabled={isLoading}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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

export default CategoryForm;