import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Package, Users, DollarSign, ShoppingBag } from 'lucide-react';
import api from '../../api/axios';

const ClientReports = () => {
  const [summary, setSummary] = useState(null);
  const [productReport, setProductReport] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        // We fetch the Summary and Product reports which you already have in your Controller
        const [summaryRes, productRes] = await Promise.all([
          api.get('/client/reports/summary'),
          api.get('/client/reports/products')
        ]);
        
        // Your backend returns { status: 'success', data: { ... } }
        setSummary(summaryRes.data.data);
        setProductReport(productRes.data.data || []);
      } catch (error) {
        console.error('Failed to fetch reports');
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* HEADER */}
      <div className="border-b border-gray-200 pb-8">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-[#111]">Reports</h1>
        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Business Intelligence</p>
      </div>

      {/* STATS GRID - Using your backend keys: totalRevenue, totalOrders, etc. */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Revenue Card */}
        <div className="bg-[#1A1A1A] text-white p-8 rounded-[2rem] relative overflow-hidden shadow-xl">
          <TrendingUp className="absolute -right-4 -bottom-4 text-white/5" size={100} />
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Total Revenue</h3>
          <p className="text-4xl font-black tracking-tighter">
            ${summary?.totalRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
          </p>
        </div>

        {/* Orders Card */}
        <div className="bg-white border border-gray-100 p-8 rounded-[2rem] shadow-sm">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Total Orders</h3>
          <p className="text-4xl font-black tracking-tighter text-[#111]">{summary?.totalOrders || 0}</p>
        </div>

        {/* Products Sold Card */}
        <div className="bg-white border border-gray-100 p-8 rounded-[2rem] shadow-sm">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Items Sold</h3>
          <p className="text-4xl font-black tracking-tighter text-[#111]">{summary?.totalProductsSold || 0}</p>
        </div>

        {/* Active Discounts Card */}
        <div className="bg-white border border-gray-100 p-8 rounded-[2rem] shadow-sm">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Active Promos</h3>
          <p className="text-4xl font-black tracking-tighter text-[#111]">{summary?.totalActiveDiscounts || 0}</p>
        </div>

      </div>

      {/* PRODUCT PERFORMANCE - Using getProductReport data */}
      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-[#111]">Product Sales Breakdown</h3>
          <Package size={18} className="text-gray-300" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="p-6 text-[9px] font-black uppercase tracking-widest text-gray-400">Product</th>
                <th className="p-6 text-[9px] font-black uppercase tracking-widest text-gray-400">Sold</th>
                <th className="p-6 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {productReport.length > 0 ? productReport.map((prod, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="p-6 text-xs font-black uppercase text-[#111]">{prod.productName}</td>
                  <td className="p-6 text-xs font-bold text-gray-500">{prod.totalSold}</td>
                  <td className="p-6 text-xs font-black text-right text-[#111]">${Number(prod.revenue).toFixed(2)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="3" className="p-12 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    No transaction data found for this period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* PLACEHOLDER FOR GRAPHS */}
      <div className="p-16 bg-gray-50 border border-dashed border-gray-200 rounded-[2.5rem] flex flex-col items-center justify-center text-center">
         <BarChart3 size={40} className="text-gray-300 mb-4" />
         <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Visual analytics will be available after more sales data is recorded.</p>
      </div>
    </div>
  );
};

export default ClientReports;