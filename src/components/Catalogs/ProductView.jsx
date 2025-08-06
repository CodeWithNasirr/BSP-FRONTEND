import React from 'react';
 
const ProductView = () => {
  const products = [
    { id: 'DM001', name: 'Twister + Cheese', price: '$2.00', image: 'https://via.placeholder.com/100', status: 'Published', retailerId: 'DM001' },
    { id: 'DM002', name: 'Crispy Strips 2PC', price: '$7.00', image: 'https://via.placeholder.com/100', status: 'Published', retailerId: 'DM002' },
    { id: 'DM003', name: 'KFC Zinger Burger with Cheese', price: '$5.00', image: 'https://via.placeholder.com/100', status: 'Published', retailerId: 'DM003' },
    { id: 'DM004', name: 'Submarine Regular', price: '$2.00', image: 'https://via.placeholder.com/100', status: 'Published', retailerId: 'DM004' },
    { id: 'DM005', name: 'HOT Drumlets 20PC', price: '$7.00', image: 'https://via.placeholder.com/100', status: 'Published', retailerId: 'DM005' },
    { id: 'DM006', name: 'Loaded Chicken and Veggie Pizza', price: '$8.00', image: 'https://via.placeholder.com/100', status: 'Published', retailerId: 'DM006' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Product View</h2>
            <button className="bg-blue-500 text-white px-4 py-2 rounded">Create New Product</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <div key={product.id} className="border rounded-lg p-2 text-center">
                <img src={product.image} alt={product.name} className="w-full h-24 object-cover mb-2" />
                <h3 className="text-sm font-medium">{product.name}</h3>
                <p className="text-xs text-gray-500">{product.price}</p>
                <p className="text-xs text-gray-500">Retailer ID: {product.retailerId}</p>
                <p className="text-xs text-green-500">Status: {product.status}</p>
                <button className="text-blue-500 text-xs mt-1">View</button>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4">
            <button className="text-red-500">Delete Selected Products</button>
            <div className="flex space-x-2">
              <button className="text-gray-500">Previous</button>
              <span>1 2 3 4 5</span>
              <button className="text-gray-500">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductView;