export default function UserProfileField({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  icon: Icon,
  required = false,
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {Icon && (
          <div className="flex items-center gap-2 mb-2">
            <Icon className="text-gray-500" />
            {label}
          </div>
        )}
        {!Icon && label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
      />
    </div>
  );
}
