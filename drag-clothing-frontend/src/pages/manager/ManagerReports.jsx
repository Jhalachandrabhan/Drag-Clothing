import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Package, Box } from 'lucide-react';
import api from '../../api/axios';

const ManagerReports = () => {
  const [data, setData] = useState({ products: null, inventory: null, sales: null, revenue: null });

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [prod, inv, sales, rev] = await Promise.all([
          api.get('/manager/reports/products'),
          api.get('/manager/reports/inventory'),
          api.get('/manager/reports/sales'),
          api.get('/manager/reports/revenue')
        ]);
        setData({ products: prod.data.data, inventory: inv.data.data, sales: sales.data.data, revenue: rev.data.data });
      } catch (error) {}
    };
    fetchReports();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="border-b border-gray-200 pb-8"><h1 className="text-4xl font-black uppercase tracking-tighter">Reports</h1></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1A1A1A] text-white p-8 rounded-[2rem] relative overflow-hidden">
          <TrendingUp className="absolute -right-4 -bottom-4 text-white/5" size={120} />
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Total Revenue</h3>
          <p className="text-5xl font-black tracking-tighter">${data.revenue?.total || '0.00'}</p>
        </div>
        
        <div className="bg-white border border-gray-100 p-8 rounded-[2rem]">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6">Operations Sync</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-gray-50"><span className="flex items-center gap-2 text-sm font-bold"><Package size={16}/> Products Logged</span><span className="font-black">{data.products?.count || 0}</span></div>
            <div className="flex justify-between items-center pb-4 border-b border-gray-50"><span className="flex items-center gap-2 text-sm font-bold"><Box size={16}/> Inventory Value</span><span className="font-black">${data.inventory?.value || '0.00'}</span></div>
            <div className="flex justify-between items-center"><span className="flex items-center gap-2 text-sm font-bold"><BarChart3 size={16}/> Sales Count</span><span className="font-black">{data.sales?.count || 0}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerReports;