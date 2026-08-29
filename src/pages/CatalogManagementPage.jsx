import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Award, Tag, Store, Plus, Edit3, Trash2 } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';

const defaultCatalogData = {
  brands: [
    { id: 1, name: 'ArtisanCraft', country: 'India', status: 'Active' },
    { id: 2, name: 'ChocoLux', country: 'Belgium', status: 'Active' },
    { id: 3, name: 'UrbanHide', country: 'Italy', status: 'Active' },
    { id: 4, name: 'FloraBloom', country: 'India', status: 'Active' }
  ],
  tags: [
    { id: 1, name: 'Bestseller', color: 'bg-purple-100 text-purple-700' },
    { id: 2, name: 'Eco-Friendly', color: 'bg-emerald-100 text-emerald-700' },
    { id: 3, name: 'Executive', color: 'bg-blue-100 text-blue-700' },
    { id: 4, name: 'Handcrafted', color: 'bg-amber-100 text-amber-700' }
  ],
  vendors: [
    { id: 1, name: 'Heritage Crafts Co.', phone: '+91 98765 00001', location: 'Jaipur' },
    { id: 2, name: 'ChocoLux Artisans', phone: '+91 98765 00002', location: 'Mumbai' },
    { id: 3, name: 'UrbanHide Studio', phone: '+91 98765 00003', location: 'Kanpur' }
  ]
};

export default function CatalogManagementPage({ type = 'brands' }) {
  const [data, setData] = useState(defaultCatalogData[type] || []);
  const [newItemName, setNewItemName] = useState('');

  const titles = {
    brands: { title: 'Brands Management', icon: Award, label: 'Brand Name' },
    tags: { title: 'Tags Management', icon: Tag, label: 'Tag Name' },
    vendors: { title: 'Vendors Management', icon: Store, label: 'Vendor Name' }
  };

  const currentConfig = titles[type] || titles.brands;
  const Icon = currentConfig.icon;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    const newItem = { id: Date.now(), name: newItemName, status: 'Active' };
    setData([newItem, ...data]);
    setNewItemName('');
    toast.success(`${currentConfig.label} added`);
  };

  const handleDelete = (id) => {
    setData(data.filter((item) => item.id !== id));
    toast.success('Item deleted');
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{currentConfig.title}</h2>
              <p className="text-xs font-semibold text-slate-400">Manage catalog attributes and partners</p>
            </div>
          </div>
        </div>

        {/* Add item form */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <form onSubmit={handleAdd} className="flex gap-4">
            <input
              type="text"
              placeholder={`Add new ${currentConfig.label}...`}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-600/20 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </form>
        </div>

        {/* List table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100">
            {data.map((item) => (
              <div key={item.id} className="p-4 px-6 flex items-center justify-between hover:bg-purple-50/20 transition-colors">
                <span className="text-xs font-bold text-slate-800">{item.name}</span>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
