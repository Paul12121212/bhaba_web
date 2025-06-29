{/* Category Filter Chips */}
<div className="mb-4 sm:mb-6">
  <div className="flex flex-wrap gap-2">
    {categories.map((categoryName) => (
      <button
        key={categoryName}
        onClick={() => {
          const newCategories = filters.categories.includes(categoryName)
            ? filters.categories.filter(name => name !== categoryName)
            : [...filters.categories, categoryName];
          setFilters({ ...filters, categories: newCategories });
        }}
        className={`flex items-center gap-1 px-3 py-1 text-xs sm:text-sm rounded-full transition-colors ${
          filters.categories.includes(categoryName)
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {/* Image */}
        {categoryImages[categoryName] && (
          <img
            src={categoryImages[categoryName]}
            alt={categoryName}
            className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover"
          />
        )}
        {/* Category Name */}
        {categoryName}
      </button>
    ))}
  </div>
</div>
