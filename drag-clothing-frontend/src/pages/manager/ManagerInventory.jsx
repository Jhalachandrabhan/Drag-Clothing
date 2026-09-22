import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, Hash, X, Loader2, AlertCircle } from 'lucide-react';
import api from '../../api/axios';

const ManagerInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [stockData, setStockData] = useState({ quantity: '' });
  
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await api.get('/manager/inventory');
      setInventory(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (error) {
      console.error('Failed to fetch inventory');
    }
  };

  // CRASH-PROOF ERROR HANDLER
  const handleApiError = (error) => {
    let msg = error?.response?.data?.message || 'An unexpected error occurred.';
    if (Array.isArray(msg)) msg = msg[0];
    if (typeof msg === 'object') msg = JSON.stringify(msg);
    setSubmitError(String(msg));
  };

  const openStockModal = (item) => {
    setSelectedItem(item);
    setStockData({ quantity: String(item.quantity || 0) });
    setSubmitError('');
    setIsStockModalOpen(true);
  };

  const handleStockUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitError('');

    try {
      // Backend expects 'quantity' in the body
      await api.patch(`/manager/inventory/${selectedItem.inventoryId}/update-stock`, { 
        quantity: Number(stockData.quantity) 
      });
      setIsStockModalOpen(false);
      fetchInventory();
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInventory = inventory.filter(item => 
    item.productName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.inventoryId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-[#111]">Stock</h1>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Inventory Management</p>
        </div>
      </div>

      <div className="relative w-full md:w-96">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
        <input 
          type="text" 
          placeholder="SEARCH PRODUCT OR ID..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="w-full bg-white border border-[#EEE] rounded-2xl py-4 pl-12 pr-6 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-[#1A1A1A] transition-all shadow-sm" 
        />
      </div>

      {filteredInventory.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-20 text-center shadow-sm flex flex-col items-center justify-center">
          <Package size={48} className="text-gray-200 mb-6" />
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">No inventory records found</h3>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-[#EEE] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Inventory ID</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Product Name</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Stock Status</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F9F9F9]">
              {filteredInventory.map((item, index) => {
                const actualId = item.inventoryId || item.id;
                const safeStock = Number(item.quantity) || 0;
                
                return (
                  <tr key={actualId || index} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="p-6">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {actualId?.substring(0, 8)}...
                      </span>
                    </td>
                    <td className="p-6">
                      <h4 className="text-sm font-black uppercase tracking-tight text-[#111]">
                        {item.productName || 'UNKNOWN PRODUCT'}
                      </h4>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                        Last updated: {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${safeStock > 10 ? 'bg-green-50 text-green-600' : safeStock > 0 ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'}`}>
                        {safeStock} Units
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <button 
                        onClick={() => openStockModal(item)} 
                        className="px-4 py-2 bg-[#FAFAFA] border border-[#EEE] hover:border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white text-[#111] rounded-xl transition-all inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-sm"
                      >
                        <Hash size={12}/> Update Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* UPDATE STOCK MODAL */}
      <AnimatePresence>
        {isStockModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsStockModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black uppercase tracking-tighter">Adjust Stock</h2>
                <button type="button" onClick={() => setIsStockModalOpen(false)} className="text-gray-400 hover:text-black"><X size={20}/></button>
              </div>
              
              <div className="mb-6 bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Target Product</p>
                <p className="text-sm font-black text-[#111] uppercase">{selectedItem?.productName || 'UNKNOWN'}</p>
                <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-2">Current: {selectedItem?.quantity} Units</p>
              </div>

              {submitError && (
                <div className="bg-red-50 text-red-600 text-[10px] font-bold uppercase p-3 rounded-xl mb-4 text-center flex items-center justify-center gap-2">
                  <AlertCircle size={14}/> {submitError}
                </div>
              )}

              <form onSubmit={handleStockUpdate} className="space-y-4">
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase ml-2">New Total Quantity</label>
                  <input 
                    required 
                    type="number" 
                    min="0" 
                    placeholder="ENTER NEW STOCK..." 
                    value={stockData.quantity} 
                    onChange={e => setStockData({ quantity: e.target.value })} 
                    className="w-full bg-[#FAFAFA] rounded-xl p-4 text-lg font-black outline-none border border-transparent focus:border-gray-200 mt-1 text-center" 
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={isLoading} 
                  className="w-full bg-[#1A1A1A] hover:bg-[#9B4819] text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest mt-2 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={16}/> : 'Confirm Update'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManagerInventory;