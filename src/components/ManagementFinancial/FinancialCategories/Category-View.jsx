import { Edit3, Folder, TrendingUp, TrendingDown, Calendar, User, Tag } from "lucide-react";

const CategoryView = ({ category, onBack, onEdit }) => {
  if (!category) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const getTypeIcon = (type) => {
    return type === "income" ? <TrendingUp className="text-green-600" size={20} /> : <TrendingDown className="text-red-600" size={20} />;
  };

  const getTypeBadge = (type) => {
    const styles = {
      income: "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300",
      expense: "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300",
    };
    const labels = {
      income: "Pendapatan",
      expense: "Pengeluaran",
    };
    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[type]}`}>{labels[type]}</span>;
  };

  const getStatusBadge = (status) => {
    const styles = {
      actual: "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300",
      plan: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300",
    };
    const labels = {
      actual: "Aktual",
      plan: "Rencana",
    };
    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>{labels[status]}</span>;
  };

  const getSubtypeBadge = (subtype) => {
    if (!subtype || subtype === "other") return null;

    const labels = {
      operating_revenue: "Pendapatan Operasional",
      non_operating_revenue: "Pendapatan Lain-lain",
      cogs: "HPP / COGS",
      operating_expense: "Beban Operasional",
      interest_expense: "Beban Bunga",
      tax_expense: "Pajak Penghasilan",
    };

    return <span className="px-3 py-1 text-sm font-medium text-purple-800 bg-purple-100 rounded-full dark:bg-purple-900/20 dark:text-purple-300">{labels[subtype] || subtype}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Section dengan tombol back di atas */}
      <div className="mb-2">
        <button onClick={onBack} className="flex items-center gap-2 mb-4 text-gray-600 transition-colors dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Detail Kategori Keuangan</h1>
            <p className="text-gray-600 dark:text-gray-400">Lihat informasi lengkap kategori</p>
          </div>
          <button onClick={() => onEdit(category)} className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-yellow-600 rounded-lg hover:bg-yellow-700">
            <Edit3 size={16} />
            Edit
          </button>
        </div>
      </div>

      <div className="p-6 space-y-8 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
        {/* Header dengan Icon dan Badges */}
        <div className="flex items-start gap-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-shrink-0">
            <div
              className="flex items-center justify-center w-24 h-24 border-2 rounded-lg"
              style={{
                backgroundColor: `${category.color}20`,
                borderColor: category.color,
              }}
            >
              {getTypeIcon(category.type)}
            </div>
          </div>
          <div className="flex-1">
            <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">{category.name}</h2>
            <div className="flex flex-wrap gap-3">
              {getTypeBadge(category.type)}
              {getStatusBadge(category.status)}
              {getSubtypeBadge(category.category_subtype)}
              <span
                className="flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full"
                style={{
                  backgroundColor: `${category.color}20`,
                  color: category.color,
                }}
              >
                <Tag size={14} />
                Warna Kategori
              </span>
            </div>
          </div>
        </div>

        {/* Informasi Utama */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <Folder size={20} />
              Informasi Kategori
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Nama Kategori</label>
                <p className="text-lg font-medium text-gray-900 dark:text-white">{category.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Jenis</label>
                  <div className="flex items-center gap-2">
                    {getTypeIcon(category.type)}
                    <span className="text-gray-900 dark:text-white">{category.type === "income" ? "Pendapatan" : "Pengeluaran"}</span>
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${category.status === "actual" ? "bg-blue-500" : "bg-yellow-500"}`}></div>
                    <span className="text-gray-900 dark:text-white">{category.status === "actual" ? "Aktual" : "Rencana"}</span>
                  </div>
                </div>
              </div>

              {category.category_subtype && category.category_subtype !== "other" && (
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Sub-Tipe Kategori</label>
                  <p className="text-gray-900 dark:text-white">
                    {{
                      operating_revenue: "Pendapatan Operasional",
                      non_operating_revenue: "Pendapatan Lain-lain",
                      cogs: "HPP / COGS",
                      operating_expense: "Beban Operasional",
                      interest_expense: "Beban Bunga",
                      tax_expense: "Pajak Penghasilan",
                    }[category.category_subtype] || category.category_subtype}
                  </p>
                </div>
              )}

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Warna</label>
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 border-2 rounded"
                    style={{
                      backgroundColor: category.color,
                      borderColor: category.color,
                    }}
                  ></div>
                  <span className="font-mono text-gray-900 dark:text-white">{category.color}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <Calendar size={20} />
              Informasi Sistem
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Dibuat Pada</label>
                <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Calendar size={16} />
                  {formatDate(category.created_at)}
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Diperbarui Pada</label>
                <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Calendar size={16} />
                  {formatDate(category.updated_at)}
                </div>
              </div>

              {category.user && (
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Dibuat Oleh</label>
                  <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <User size={16} />
                    {category.user.name || "User"}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Deskripsi */}
        {category.description && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Deskripsi</h3>
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600">
              <p className="leading-relaxed text-gray-900 whitespace-pre-line dark:text-white">{category.description}</p>
            </div>
          </div>
        )}

        {/* Statistik (placeholder untuk fitur transaksi nanti) */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Statistik Kategori</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="p-4 text-center border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600">
              <p className="mb-1 text-2xl font-bold text-gray-900 dark:text-white">0</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Transaksi</p>
            </div>
            <div className="p-4 text-center border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600">
              <p className={`text-2xl font-bold mb-1 ${category.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>Rp 0</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total {category.type === "income" ? "Pendapatan" : "Pengeluaran"}</p>
            </div>
            <div className="p-4 text-center border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600">
              <p className="mb-1 text-2xl font-bold text-gray-900 dark:text-white">-</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Rata-rata per Bulan</p>
            </div>
          </div>
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">* Statistik akan tersedia setelah menambahkan transaksi</p>
        </div>

        {/* Action Buttons di bagian bawah */}
        <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button type="button" onClick={onBack} className="px-6 py-3 text-gray-700 transition-colors border border-gray-300 rounded-lg dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            Kembali ke Daftar
          </button>
          <button type="button" onClick={() => onEdit(category)} className="flex items-center justify-center flex-1 gap-2 py-3 text-white transition-colors bg-yellow-600 rounded-lg hover:bg-yellow-700">
            <Edit3 size={16} />
            Edit Kategori
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryView;
