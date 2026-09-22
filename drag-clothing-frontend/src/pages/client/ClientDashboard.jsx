import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Users, Tags, ArrowUpRight, Activity } from 'lucide-react';
import api from '../../api/axios';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    totalProducts: 0,
    activeManagers: 0,
    activeDiscounts: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch the standard dashboard data (missing discounts)
      const dashRes = await api.get('/client/dashboard');
      const apiData = dashRes.data.data || {};

      // 2. THE HACK: Manually fetch the discounts route just to count them
      let manualDiscountCount = 0;
      try {
        const discRes = await api.get('/client/discounts');
        const discountsList = discRes.data.data || [];
        
        // Count only the active ones to be completely accurate
        manualDiscountCount = discountsList.filter(d => d.isActive == 1 || d.isActive === true).length;
      } catch (discError) {
        console.error('Could not fetch discounts for count:', discError);
      }

      // 3. Merge the backend data with our manual frontend count
      setData({
        totalProducts: apiData.totalProducts || 0,
        activeManagers: apiData.totalManagers || 0, // Using exact key from your backend
        activeDiscounts: manualDiscountCount // Forcing the manual count here!
      });

    } catch (error) {
      console.error('Dashboard fetch failed:', error);
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  const stats = [
    { label: "My Products", value: data.totalProducts, icon: <Package size={20} />, color: "bg-[#EBE9E0]", path: "/client/products" },
    { label: "Store Managers", value: data.activeManagers, icon: <Users size={20} />, color: "bg-[#D4DFE6]", path: "/client/managers" },
    { label: "Active Promos", value: data.activeDiscounts, icon: <Tags size={20} />, color: "bg-[#D9E2D5]", path: "/client/discounts" }
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-12 pb-20 animate-fade-in">
      
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex flex-col md:flex-row justify-between items-end border-b border-[#E5E5E5] pb-10 gap-6">
        <div>
          <div className="inline-block bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-[0.3em] px-3 py-1 mb-6 rounded-full">
            Terminal Access
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-[#111] leading-none">
            Brand <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#111] to-[#999]">Command.</span>
          </h1>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div 
            key={index} initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: index * 0.1 }}
            onClick={() => navigate(stat.path)}
            className={`${stat.color} rounded-[2rem] p-8 flex flex-col justify-between min-h-[200px] group cursor-pointer relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1`}
          >
            <div className="absolute -right-4 -bottom-4 text-black/5 group-hover:text-black/10 transition-colors">
               {React.cloneElement(stat.icon, { size: 120 })}
            </div>
            <div className="flex justify-between items-start relative z-10">
              <div className="p-3 bg-white/40 backdrop-blur-md rounded-2xl border border-white/20">{stat.icon}</div>
              <ArrowUpRight size={20} className="text-black/30 group-hover:text-black group-hover:scale-110 transition-all" />
            </div>
            <div className="relative z-10 mt-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/50 mb-1">{stat.label}</p>
              <h3 className="text-5xl font-black tracking-tighter">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.4 }} className="bg-white rounded-[2.5rem] border border-[#E5E5E5] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-[#F5F5F5] flex justify-between items-center">
          <h2 className="text-sm font-black uppercase tracking-widest">Recent Sales Activity</h2>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Live Status</span>
          </div>
        </div>
        <div className="p-12 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-[#F5F5F5] rounded-full flex items-center justify-center mb-6">
             <Activity size={32} className="text-gray-300" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">[ Awaiting transaction data ]</p>
        </div>
      </motion.div>
    </div>
  );
};

export default ClientDashboard;