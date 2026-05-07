import { Calendar } from 'lucide-react';

const YearDisplay = ({ 
    availableYears, 
    selectedYear, 
    onYearChange,
    summaries 
}) => {
    const getSummaryCount = (year) => {
        return summaries.filter(s => s.year === year).length;
    };

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {/* Year Info */}
            <div className="flex-1">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                        <Calendar className="text-blue-600 dark:text-blue-400" size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            Tahun {selectedYear}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {getSummaryCount(selectedYear)} ringkasan bulanan
                        </p>
                    </div>
                </div>
            </div>

            {/* Year Selector */}
            <div className="flex items-center gap-2">
                <select
                    value={selectedYear}
                    onChange={(e) => onYearChange(parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white bg-white text-sm"
                >
                    {availableYears.map(year => (
                        <option key={year} value={year}>
                            {year} 
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default YearDisplay;
