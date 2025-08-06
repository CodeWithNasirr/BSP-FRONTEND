import React, { useState } from 'react';
 
const CreateProduct = () => {
  const [formData, setFormData] = useState({
    name: '', price: '', retailerId: '', description: '', imageUrl: '', category: '', customizable: false
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleCheckbox = (e) => setFormData({ ...formData, [e.target.name]: e.target.checked });
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData); // API call to save product
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar (same as ProductView) */}
    
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Create Product</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Product Name</label>
              <input name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium">Price</label>
              <input name="price" value={formData.price} onChange={handleChange} className="w-full p-2 border rounded" placeholder="USD" />
            </div>
            <div>
              <label className="block text-sm font-medium">Retailer ID</label>
              <input name="retailerId" value={formData.retailerId} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium">Image URL</label>
              <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium">Category</label>
              <input name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium">
                <input type="checkbox" name="customizable" checked={formData.customizable} onChange={handleCheckbox} />
                Customizable
              </label>
            </div>
            <div className="flex justify-end space-x-4">
              <button type="button" className="text-red-500">Cancel</button>
              <button type="button" className="text-gray-500">Clear</button>
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Create</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProduct;