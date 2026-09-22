import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Box, BarChart3, ArrowUpRight } from 'lucide-react';
import api from '../../api/axios';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ products: 0, inventoryAlerts: 0, salesToday: 0 });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/manager/dashboard');
        setData(res.data.data || { products: 0, inventoryAlerts: 0, salesToday: 0 });
      } catch (error) {}
    };
    fetchDashboard();
  }, []);

  const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

  const stats = [
    { label: "Products Managed", value: data.products, icon: <Package size={20} />, color: "bg-[#EBE9E0]", path: "/manager/products" },
    { label: "Stock Alerts", value: data.inventoryAlerts, icon: <Box size={20} />, color: "bg-[#D4DFE6]", path: "/manager/inventory" },
    { label: "Today's Sales", value: data.salesToday, icon: <BarChart3 size={20} />, color: "bg-[#D9E2D5]", path: "/manager/reports" }
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-12 animate-fade-in">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex justify-between items-end border-b border-[#E5E5E5] pb-10">
        <div>
          <div className="inline-block bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-[0.3em] px-3 py-1 mb-6 rounded-full">Store Front</div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-[#111] leading-none">Operations<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#111] to-[#999]">Overview.</span></h1>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div key={i} initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: i * 0.1 }} onClick={() => navigate(stat.path)} className={`${stat.color} rounded-[2rem] p-8 flex flex-col justify-between min-h-[200px] group cursor-pointer relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1`}>
            <div className="absolute -right-4 -bottom-4 text-black/5 group-hover:text-black/10"><div className="w-32 h-32">{stat.icon}</div></div>
            <div className="flex justify-between items-start relative z-10"><div className="p-3 bg-white/40 backdrop-blur-md rounded-2xl">{stat.icon}</div><ArrowUpRight size={20} className="text-black/30 group-hover:text-black transition-all" /></div>
            <div className="relative z-10 mt-8"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/50 mb-1">{stat.label}</p><h3 className="text-5xl font-black tracking-tighter">{stat.value}</h3></div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ManagerDashboard;