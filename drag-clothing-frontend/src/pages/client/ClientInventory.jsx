import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Plus, Search, Loader2, X, AlertCircle, Edit2 } from 'lucide-react';
import api from '../../api/axios';

const ClientInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [managers, setManagers] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [formData, setFormData] = useState({ 
    productId: '', managerId: '', quantity: '' 
  });

  useEffect(() => { 
    fetchInventory(); fetchProducts(); fetchManagers();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await api.get('/client/inventory');
      setInventory(res.data.data || []);
    } catch (error) { console.error('Fetch inventory failed'); }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/client/products');
      setProducts(res.data.data || []);
    } catch (error) { console.error('Fetch products failed'); }
  };

  const fetchManagers = async () => {
    try {
      const res = await api.get('/client/managers'); 
      setManagers(res.data.data || []);
    } catch (error) { console.error('Fetch managers failed'); }
  };

  const openEditModal = (inv) => {
    setSubmitError('');
    setFormData({ 
      productId: inv.productId || '', 
      managerId: inv.managerId || '', 
      quantity: inv.quantity || '' 
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setSubmitError(''); setIsLoading(true); 
    try {
      const payload = {
        managerId: formData.managerId, 
        productId: formData.productId,
        quantity: parseInt(formData.quantity, 10) 
      };
      await api.post('/client/inventory/distribute', payload);
      setIsModalOpen(false); 
      setFormData({ productId: '', managerId: '', quantity: '' });
      fetchInventory();
    } catch (error) {
      let msg = error.response?.data?.message || 'Action failed.';
      if (Array.isArray(msg)) msg = msg[0];
      setSubmitError(String(msg));
    } finally { setIsLoading(false); }
  };

  const filteredData = inventory.filter(i => 
    i.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.managerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in p-4">
      <div className="flex justify-between items-center border-b border-gray-200 pb-8">
        <div>
           <h1 className="text-4xl font-black uppercase tracking-tighter text-[#111]">Product Stock</h1>
           <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Inventory Management</p>
        </div>
        <button onClick={() => { setFormData({productId:'', managerId:'', quantity:''}); setIsModalOpen(true); }} className="bg-[#1A1A1A] text-white px-6 py-3 rounded-2xl hover:bg-[#9B4819] transition-all flex items-center gap-2 font-bold uppercase text-[10px] shadow-xl">
          <Plus size={16} /> Distribute Stock
        </button>
      </div>

      <div className="relative w-full md:w-96">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
        <input type="text" placeholder="SEARCH PRODUCT OR MANAGER..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white border border-[#EEE] rounded-2xl py-4 pl-12 pr-6 text-[10px] font-bold uppercase outline-none focus:border-[#1A1A1A] transition-all" />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-[#EEE] overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#F5F5F5] bg-gray-50/50">
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Product Name</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Assigned Manager</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Quantity Status</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Edit Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F9F9F9]">
            {filteredData.map((inv, idx) => {
              const safeQuantity = Number(inv.quantity) || 0;
              return (
                <tr key={inv.inventoryId || idx} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="p-6 font-black uppercase text-sm text-[#111]">{inv.productName}</td>
                  <td className="p-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">{inv.managerName || 'Unassigned'}</td>
                  <td className="p-6">
                     <div className="flex items-center gap-3">
                        <span className={`font-mono font-black text-sm ${safeQuantity < 10 ? 'text-red-600' : 'text-[#111]'}`}>
                           {safeQuantity} Units
                        </span>
                        {safeQuantity < 10 && (
                           <span className="flex items-center gap-1 bg-red-50 text-red-600 text-[8px] px-2 py-1 rounded-lg font-black uppercase tracking-widest">
                             <AlertCircle size={10} /> Low Stock
                           </span>
                        )}
                     </div>
                  </td>
                  <td className="p-6 text-right">
                    <button onClick={() => openEditModal(inv)} className="p-2 bg-gray-100 hover:bg-[#1A1A1A] hover:text-white rounded-xl transition-all text-[#111]">
                      <Edit2 size={16} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-xl rounded-[3rem] p-12 shadow-2xl">
              <div className="flex justify-between items-start mb-8">
                <h2 className="text-3xl font-black uppercase tracking-tighter">Distribute Stock</h2>
                <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
              </div>
              {submitError && <div className="bg-red-50 text-red-600 text-[10px] font-bold uppercase p-4 rounded-2xl mb-6 text-center border border-red-100">{submitError}</div>}
              <form onSubmit={handleSubmit} className="space-y-6">
                <select required value={formData.managerId} onChange={e => setFormData({...formData, managerId: e.target.value})} className="w-full bg-[#FAFAFA] rounded-2xl p-5 text-[11px] font-bold outline-none appearance-none">
                  <option value="">SELECT MANAGER</option>
                  {managers.map((m, index) => <option key={m.id || index} value={m.id || m.managerId}>{String(m.name).toUpperCase()}</option>)}
                </select>
                <select required value={formData.productId} onChange={e => setFormData({...formData, productId: e.target.value})} className="w-full bg-[#FAFAFA] rounded-2xl p-5 text-[11px] font-bold outline-none appearance-none">
                  <option value="">SELECT PRODUCT</option>
                  {products.map((p, index) => <option key={p.id || index} value={p.id || p.productId}>{String(p.name).toUpperCase()}</option>)}
                </select>
                <input required type="number" min="0" placeholder="QUANTITY" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="w-full bg-[#FAFAFA] rounded-2xl p-5 text-[11px] font-bold outline-none border border-transparent focus:border-gray-200" />
                <button type="submit" disabled={isLoading} className="w-full bg-[#1A1A1A] hover:bg-[#9B4819] text-white py-6 rounded-2xl text-[10px] font-black uppercase transition-all shadow-xl">
                  {isLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Confirm Distribution'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientInventory;