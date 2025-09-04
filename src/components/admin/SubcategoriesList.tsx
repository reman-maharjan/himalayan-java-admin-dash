'use client';

import { useState, useEffect } from 'react';
import { productService, SubCategory } from '@/lib/api/products';

export default function SubcategoriesList() {
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);

  useEffect(() => {
    // Fetch categories when component mounts
    const fetchCategories = async () => {
      try {
        const data = await productService.getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    // Fetch subcategories when selectedCategory changes
    const fetchSubcategories = async () => {
      if (!selectedCategory) {
        setSubcategories([]);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const data = await productService.getSubcategories(Number(selectedCategory));
        setSubcategories(data);
      } catch (err) {
        console.error('Error fetching subcategories:', err);
        setError('Failed to load subcategories');
      } finally {
        setLoading(false);
      }
    };

    fetchSubcategories();
  }, [selectedCategory]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Subcategories</h1>
      
      <div className="mb-6">
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
          Select Category
        </label>
        <select
          id="category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : '')}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">-- Select a category --</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {loading && selectedCategory && <p>Loading subcategories...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {!loading && selectedCategory && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {subcategories.length > 0 ? (
              subcategories.map((subcategory) => (
                <li key={subcategory.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{subcategory.name}</h3>
                      <p className="text-sm text-gray-500">ID: {subcategory.id}</p>
                    </div>
                    <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                      {categories.find(c => c.id === subcategory.category)?.name || 'Unknown Category'}
                    </span>
                  </div>
                </li>
              ))
            ) : (
              !error && <li className="px-6 py-4 text-gray-500">No subcategories found for this category.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
