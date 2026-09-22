import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, X, Loader2, Power, PowerOff, AlertTriangle, RefreshCcw, Edit2, Tag, Users as UsersIcon } from 'lucide-react';
import api from '../../api/axios';

const ManagerProducts = () => {
  const [viewMode, setViewMode] = useState('live'); // live | offline
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); 
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    gender: 'UNISEX'
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      // This now calls your updated backend that filters by managerId
      const res = await api.get('/manager/products');
      setProducts(res.data.data || []);
    } catch (error) {
      console.error('Fetch products failed:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data || []);
    } catch (error) {
      console.error('Fetch categories failed:', error);
    }
  };

  // UPDATED: Now strictly uses your backend alias 'productId'
  const getTargetId = (p) => p?.productId;

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setSubmitError('');
    
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      categoryId: product.categoryId || '',
      gender: product.gender || 'UNISEX'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitError('');

    try {
      const payload = { 
        name: formData.name,
        description: formData.description,
        price: Number(formData.price) 
      };

      // Uses getTargetId which maps to your 'productId' alias
      await api.put(`/manager/products/${getTargetId(selectedProduct)}`, payload);
      
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Action failed.';
      setSubmitError(Array.isArray(errMsg) ? errMsg[0] : errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusToggle = async (status) => {
    setIsLoading(true);
    try {
      await api.patch(`/manager/products/${getTargetId(selectedProduct)}/live`, { isActive: status });
      setIsStatusModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Status update failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = products
    .filter(p => {
      // Handles both boolean and numeric (1/0) isActive values from database
      const isActive = p.isActive == 1 || p.isActive === true;
      return viewMode === 'live' ? isActive : !isActive;
    })
    .filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 animate-fade-in p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-[#111]">Managed Catalog</h1>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Products Assigned to You</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="bg-white p-1 rounded-2xl border border-gray-100 flex shadow-sm w-full md:w-auto">
            <button onClick={() => setViewMode('live')} className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${viewMode === 'live' ? 'bg-[#1A1A1A] text-white' : 'text-gray-400 hover:text-black'}`}><Power size={14} /> Live</button>
            <button onClick={() => setViewMode('offline')} className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${viewMode === 'offline' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-orange-500'}`}><PowerOff size={14} /> Offline</button>
          </div>
        </div>
      </div>

      <div className="relative w-full md:w-96">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
        <input type="text" placeholder="SEARCH ASSIGNED PRODUCTS..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white border border-[#EEE] rounded-2xl py-4 pl-12 pr-6 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-[#1A1A1A] transition-all shadow-sm" />
      </div>

      {filteredData.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-16 text-center shadow-sm flex flex-col items-center">
          <Package size={40} className="text-gray-200 mb-4" />
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">No {viewMode} Products Found</h3>
          <p className="text-[9px] text-gray-400 uppercase mt-2">Only products assigned to your manager ID will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-[#EEE] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#F5F5F5] bg-gray-50/50">
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Product Info</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Taxonomy</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F9F9F9]">
              {filteredData.map((product) => {
                const pid = getTargetId(product);
                const isActive = product.isActive == 1 || product.isActive === true;
                const categoryName = categories.find(c => String(c.id) === String(product.categoryId))?.name || 'Uncategorized';

                return (
                  <tr key={pid} className="hover:bg-[#FAFAFA] transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-[12px] ${!isActive ? 'bg-orange-50 text-orange-500' : 'bg-[#111] text-white shadow-md'}`}>
                          {product.name?.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className={`text-sm font-black uppercase tracking-tight ${!isActive ? 'text-gray-400' : 'text-[#111]'}`}>{product.name}</h4>
                          <p className="text-[10px] font-bold text-gray-400">${product.price}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-[#9B4819]">
                          <Tag size={10} /> {categoryName}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-gray-500">
                          <UsersIcon size={10} /> {product.gender || 'UNISEX'}
                        </span>
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-3">
                        {isActive ? (
                          <>
                            <button onClick={() => openEditModal(product)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-[#1A1A1A] hover:text-white text-[#111] text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm"><Edit2 size={12} /> Edit</button>
                            <button onClick={() => { setSelectedProduct(product); setIsStatusModalOpen(true); }} className="p-2 bg-orange-50 hover:bg-orange-500 hover:text-white text-orange-600 rounded-xl transition-all"><PowerOff size={16} /></button>
                          </>
                        ) : (
                          <button onClick={() => { setSelectedProduct(product); handleStatusToggle(true); }} className="px-4 py-2 bg-green-50 text-[10px] flex items-center gap-2 font-black uppercase tracking-widest text-green-600 hover:bg-green-600 hover:text-white rounded-xl transition-all shadow-sm"><RefreshCcw size={12}/> Set Live</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODALS (EDIT & STATUS TOGGLE) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }} className="relative bg-white w-full max-w-2xl rounded-[3rem] p-12 shadow-2xl">
              <div className="flex justify-between items-start mb-8">
                <h2 className="text-3xl font-black uppercase tracking-tighter">Edit Product</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
              </div>

              {submitError && (
                <div className="bg-red-50 text-red-600 text-[10px] font-bold uppercase p-4 rounded-2xl mb-6 border border-red-100 text-center">{submitError}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Name</label>
                  <input required placeholder="PRODUCT NAME" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#FAFAFA] rounded-2xl p-4 text-[11px] font-bold outline-none border border-transparent focus:border-gray-200 mt-1" />
                </div>
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Description</label>
                  <textarea placeholder="DESCRIPTION" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="3" className="w-full bg-[#FAFAFA] rounded-2xl p-4 text-[11px] font-bold outline-none border border-transparent focus:border-gray-200 mt-1 resize-none" />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Price ($)</label>
                    <input required type="number" step="0.01" min="0" placeholder="PRICE" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-[#FAFAFA] rounded-2xl p-4 text-[11px] font-bold outline-none border border-transparent focus:border-gray-200 mt-1" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Assigned Category</label>
                    <div className="w-full bg-gray-50 text-gray-400 rounded-2xl p-4 text-[11px] font-bold border border-transparent mt-1">
                      {categories.find(c => String(c.id) === String(formData.categoryId))?.name || 'LOCKED'}
                    </div>
                  </div>
                </div>
                
                <button type="submit" disabled={isLoading} className="w-full bg-[#1A1A1A] hover:bg-[#9B4819] flex justify-center items-center text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] transition-all shadow-xl">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Specifications'}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {isStatusModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl text-center">
              <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 mb-6 mx-auto"><AlertTriangle size={32} /></div>
              <h2 className="text-2xl font-black uppercase mb-2">Deactivate?</h2>
              <p className="text-gray-500 text-xs mb-8">Move <strong>{selectedProduct?.name}</strong> to offline status?</p>
              <div className="space-y-3">
                <button onClick={() => handleStatusToggle(false)} disabled={isLoading} className="w-full bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Confirm Deactivation</button>
                <button onClick={() => setIsStatusModalOpen(false)} className="w-full bg-transparent text-gray-400 py-4 text-[10px] font-black uppercase">Go Back</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManagerProducts;