import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Plus, Edit2, Trash2, X, Archive, RefreshCcw, Hash, Loader2 } from 'lucide-react';
import api from '../../api/axios';

const ManagerVariants = () => {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [variants, setVariants] = useState([]);
  const [viewMode, setViewMode] = useState('active'); // active | archived
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedVariant, setSelectedVariant] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Main Form
  const [formData, setFormData] = useState({ 
    size: '', 
    color: '', 
    price: '', 
    stock: '' 
  });

  // Quick Stock Form
  const [stockData, setStockData] = useState({ stock: '' });

  useEffect(() => { 
    fetchProducts(); 
  }, []);

  useEffect(() => { 
    if (selectedProductId) {
      fetchVariants(selectedProductId); 
    } else {
      setVariants([]); 
    }
  }, [selectedProductId]);

  const fetchProducts = async () => {
    try { 
      const res = await api.get('/manager/products'); 
      const activeProducts = (res.data.data || []).filter(p => p.isActive == 1 || p.isActive === true);
      setProducts(Array.isArray(activeProducts) ? activeProducts : []); 
    } catch (error) {
      console.error('Failed to fetch products');
    }
  };

  const fetchVariants = async (prodId) => {
    try { 
      const res = await api.get(`/manager/product-variants/${prodId}`); 
      setVariants(Array.isArray(res.data.data) ? res.data.data : []); 
    } catch (error) {
      console.error('Failed to fetch variants');
    }
  };

  // CRASH-PROOF ERROR HANDLER
  const handleApiError = (error) => {
    let msg = error?.response?.data?.message || 'An unexpected error occurred.';
    if (Array.isArray(msg)) msg = msg[0];
    if (typeof msg === 'object') msg = JSON.stringify(msg);
    setSubmitError(String(msg)); // Forces it to be a string so React never crashes
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitError('');

    try {
      const payload = {
        size: formData.size,
        color: formData.color,
        price: Number(formData.price),
        stock: Number(formData.stock)
      };

      if (modalMode === 'add') {
        payload.productId = selectedProductId;
        await api.post('/manager/product-variants', payload);
      } else {
        await api.put(`/manager/product-variants/${selectedVariant.id}`, payload);
      }
      
      setIsModalOpen(false); 
      fetchVariants(selectedProductId);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStockUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitError('');

    try {
      await api.patch(`/manager/product-variants/${selectedVariant.id}/update-stock`, { 
        stock: Number(stockData.stock) 
      });
      setIsStockModalOpen(false);
      fetchVariants(selectedProductId);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Move this variant to the bin?")) return;
    try { 
      await api.delete(`/manager/product-variants/${id}`); 
      fetchVariants(selectedProductId); 
    } catch (error) {
      console.error('Delete failed');
    }
  };

  const handleRestore = async (id) => {
    try { 
      await api.patch(`/manager/product-variants/${id}/restore`); 
      fetchVariants(selectedProductId); 
    } catch (error) {
      console.error('Restore failed');
    }
  };

  const filteredVariants = variants.filter(v => {
    const isActive = v.isActive == 1 || v.isActive === true;
    return viewMode === 'active' ? isActive : !isActive;
  });

  return (
    <div className="space-y-8 animate-fade-in p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Variants</h1>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Sizes, Colors & Stock</p>
        </div>
        
        <select 
          value={selectedProductId} 
          onChange={e => setSelectedProductId(e.target.value)} 
          className="bg-[#FAFAFA] border border-[#EEE] rounded-2xl py-5 px-6 text-[11px] font-bold uppercase tracking-widest outline-none min-w-[300px] shadow-sm appearance-none cursor-pointer focus:ring-2 focus:ring-[#1A1A1A]"
        >
          <option value="">-- SELECT PRODUCT TO VIEW --</option>
          {products.map(p => {
            const actualId = p.productId || p.id;
            const safeName = p.name ? String(p.name).toUpperCase() : 'UNKNOWN PRODUCT';
            return <option key={actualId} value={actualId}>{safeName}</option>
          })}
        </select>
      </div>

      {!selectedProductId ? (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-20 text-center shadow-sm flex flex-col items-center justify-center mt-12">
          <Layers size={48} className="text-gray-200 mb-6" />
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Select a product above to manage variants</h3>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="bg-white p-1 rounded-2xl border border-gray-100 flex shadow-sm w-full md:w-auto">
              <button onClick={() => setViewMode('active')} className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${viewMode === 'active' ? 'bg-[#1A1A1A] text-white' : 'text-gray-400 hover:text-black'}`}>
                Active
              </button>
              <button onClick={() => setViewMode('archived')} className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'archived' ? 'bg-red-50 text-red-600' : 'text-gray-400 hover:text-red-500'}`}>
                <Archive size={14} /> Bin
              </button>
            </div>

            <button onClick={() => { 
              setModalMode('add'); 
              setSubmitError('');
              setFormData({ size: '', color: '', price: '', stock: '' }); 
              setIsModalOpen(true); 
            }} className="bg-[#1A1A1A] text-white px-6 py-3 rounded-2xl hover:bg-[#9B4819] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl transition-all">
              <Plus size={16}/> Add Variant
            </button>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-[#EEE] overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Attributes</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Price</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Inventory Stock</th>
                  <th className="p-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F9F9F9]">
                {filteredVariants.length > 0 ? (
                  filteredVariants.map((v) => {
                    const safeStock = Number(v.stock) || 0;
                    return (
                      <tr key={v.id} className="hover:bg-[#FAFAFA] transition-colors">
                        <td className="p-6">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1.5 bg-[#EBE9E0] text-[#9B4819] rounded-lg text-[10px] font-black uppercase tracking-widest">
                              SIZE: {v.size || 'N/A'}
                            </span>
                            <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                              COLOR: {v.color || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className={`p-6 font-black text-sm ${viewMode === 'archived' ? 'text-gray-400' : 'text-[#111]'}`}>
                          ${v.price || '0.00'}
                        </td>
                        <td className="p-6">
                           <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${safeStock > 10 ? 'bg-green-50 text-green-600' : safeStock > 0 ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'}`}>
                              {safeStock} in stock
                           </span>
                        </td>
                        <td className="p-6 text-right">
                          <div className="flex justify-end gap-2">
                            {viewMode === 'active' ? (
                              <>
                                <button onClick={() => { 
                                  setSelectedVariant(v); 
                                  setStockData({ stock: String(safeStock) });
                                  setSubmitError('');
                                  setIsStockModalOpen(true); 
                                }} className="px-3 py-2 bg-[#FAFAFA] border border-[#EEE] hover:border-[#1A1A1A] text-[#111] rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-sm">
                                  <Hash size={12}/> Update Stock
                                </button>
                                <button onClick={() => { 
                                  setModalMode('edit'); 
                                  setSelectedVariant(v); 
                                  setSubmitError('');
                                  setFormData({ size: v.size || '', color: v.color || '', price: v.price || '', stock: safeStock }); 
                                  setIsModalOpen(true); 
                                }} className="p-2 text-gray-500 hover:bg-[#1A1A1A] hover:text-white rounded-xl transition-colors">
                                  <Edit2 size={16}/>
                                </button>
                                <button onClick={() => handleDelete(v.id)} className="p-2 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-colors">
                                  <Trash2 size={16}/>
                                </button>
                              </>
                            ) : (
                              <button onClick={() => handleRestore(v.id)} className="px-4 py-2 bg-green-50 text-[10px] flex items-center gap-2 font-black uppercase tracking-widest text-green-600 hover:bg-green-600 hover:text-white rounded-xl transition-all">
                                <RefreshCcw size={12}/> Set Live
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="p-12 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest">
                      {viewMode === 'active' ? 'No active variants found for this product.' : 'No variants in the bin. (Note: Backend may be filtering them out).'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FULL CREATE/EDIT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }} className="relative bg-white w-full max-w-lg rounded-[3rem] p-12 shadow-2xl">
              <div className="flex justify-between items-start mb-8">
                <h2 className="text-3xl font-black uppercase tracking-tighter">{modalMode === 'add' ? 'Add Variant' : 'Edit Variant'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24}/></button>
              </div>

              {submitError && (
                <div className="bg-red-50 text-red-600 text-[10px] font-bold uppercase p-4 rounded-2xl mb-6 border border-red-100 text-center">
                  {submitError}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Size / Variation</label>
                    <input required placeholder="E.G. XL" value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} className="w-full bg-[#FAFAFA] rounded-xl p-4 text-[11px] font-bold outline-none border border-transparent focus:border-gray-200 mt-1" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Color</label>
                    <input required placeholder="E.G. RED" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} className="w-full bg-[#FAFAFA] rounded-xl p-4 text-[11px] font-bold outline-none border border-transparent focus:border-gray-200 mt-1" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Price ($)</label>
                    <input required type="number" step="0.01" min="0" placeholder="PRICE" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-[#FAFAFA] rounded-xl p-4 text-[11px] font-bold outline-none border border-transparent focus:border-gray-200 mt-1" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Initial Stock</label>
                    <input required type="number" min="0" placeholder="STOCK COUNT" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full bg-[#FAFAFA] rounded-xl p-4 text-[11px] font-bold outline-none border border-transparent focus:border-gray-200 mt-1" />
                  </div>
                </div>

                <button type="submit" disabled={isLoading} className="w-full bg-[#1A1A1A] hover:bg-[#9B4819] text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest mt-8 transition-all shadow-xl">
                  {isLoading ? <Loader2 className="animate-spin mx-auto" size={16}/> : 'Save Configuration'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QUICK STOCK UPDATE MODAL */}
      <AnimatePresence>
        {isStockModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsStockModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black uppercase tracking-tighter">Adjust Stock</h2>
                <button type="button" onClick={() => setIsStockModalOpen(false)} className="text-gray-400 hover:text-black"><X size={20}/></button>
              </div>
              
              <div className="mb-6 bg-gray-50 p-4 rounded-xl flex items-center justify-center gap-3">
                <span className="px-2 py-1 bg-white border border-gray-200 rounded text-[10px] font-black uppercase">{selectedVariant?.size || 'N/A'}</span>
                <span className="px-2 py-1 bg-white border border-gray-200 rounded text-[10px] font-black uppercase">{selectedVariant?.color || 'N/A'}</span>
              </div>

              {submitError && <div className="bg-red-50 text-red-600 text-[10px] font-bold uppercase p-3 rounded-xl mb-4 text-center">{submitError}</div>}

              <form onSubmit={handleStockUpdate} className="space-y-4">
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase ml-2">New Stock Quantity</label>
                  <input required type="number" min="0" placeholder="ENTER NEW STOCK..." value={stockData.stock} onChange={e => setStockData({ stock: e.target.value })} className="w-full bg-[#FAFAFA] rounded-xl p-4 text-sm font-black outline-none border border-transparent focus:border-gray-200 mt-1 text-center" />
                </div>
                
                <button type="submit" disabled={isLoading} className="w-full bg-[#1A1A1A] hover:bg-[#9B4819] text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest mt-2 transition-all">
                  {isLoading ? <Loader2 className="animate-spin mx-auto" size={16}/> : 'Confirm Update'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  ); 
};

export default ManagerVariants;