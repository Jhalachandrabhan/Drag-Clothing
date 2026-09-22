import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Package, Box, Layers, BarChart3, LogOut, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AdminProfileDrawer from '../../components/AdminProfileDrawer';

const ManagerLayout = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', path: '/manager/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Incoming Orders', path: '/manager/orders', icon: <ShoppingCart size={18} /> },
    { name: 'Products', path: '/manager/products', icon: <Package size={18} /> },
    { name: 'Variants', path: '/manager/variants', icon: <Layers size={18} /> },
    { name: 'Inventory', path: '/manager/inventory', icon: <Box size={18} /> },
    { name: 'Reports', path: '/manager/reports', icon: <BarChart3 size={18} /> },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#FAFAFA] font-sans text-[#1A1A1A] selection:bg-[#9B4819] selection:text-white relative">
      <aside className="w-72 bg-[#0A0A0A] text-white flex flex-col z-30 relative overflow-hidden">
        {/* DECOR: Tire Tread Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none overflow-hidden">
           <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <pattern id="tireTrack" x="0" y="0" width="40" height="100" patternUnits="userSpaceOnUse" patternTransform="rotate(-15)">
                <path d="M10 0 L10 100 M30 0 L30 100" stroke="white" strokeWidth="8" strokeDasharray="15 10"/>
                <path d="M0 20 L40 40 M0 60 L40 80" stroke="white" strokeWidth="2"/>
              </pattern>
              <rect width="100%" height="100%" fill="url(#tireTrack)" />
           </svg>
        </div>

        <div className="p-8 border-b border-white/5 relative z-10">
          <Link to="/manager/dashboard" className="text-2xl font-black tracking-tighter text-white group">
            STORE<span className="text-[#9B4819] group-hover:animate-pulse">.</span>
          </Link>
          <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.5em] mt-3 italic">Operations Unit</p>
        </div>
        
        <nav className="flex-1 p-6 space-y-1 overflow-y-auto relative z-10 custom-scrollbar">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className={`flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-500 group relative overflow-hidden ${isActive(item.path) ? 'text-white' : 'text-white/30 hover:text-white'}`}>
              {isActive(item.path) && <motion.div layoutId="activeGlow" className="absolute inset-0 bg-gradient-to-r from-[#9B4819]/20 to-transparent border-l-2 border-[#9B4819] z-0" />}
              <span className={`relative z-10 transition-all duration-300 ${isActive(item.path) ? 'text-[#9B4819]' : 'group-hover:rotate-12 group-hover:scale-110'}`}>{item.icon}</span>
              <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.25em]">{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        <header className="h-16 border-b border-gray-100 flex items-center justify-end px-10 bg-white/80 backdrop-blur-md z-20">
           <div className="flex items-center gap-6">
              <button onClick={() => setIsProfileOpen(true)} className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity group">
                <div className="text-right">
                   <p className="text-[10px] font-black uppercase tracking-tight leading-none text-[#111]">{user?.name || 'Manager'}</p>
                   <p className="text-[8px] font-bold text-[#9B4819] uppercase tracking-widest mt-1">Store Operations</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[#111] flex items-center justify-center font-black text-[10px] text-white border border-white/10 shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
                  {user?.name?.charAt(0) || 'M'}
                </div>
              </button>

              {/* Separator and new Logout Icon */}
              <div className="w-px h-6 bg-gray-200"></div>
              <button 
                onClick={handleLogout} 
                className="text-gray-400 hover:text-red-500 transition-colors p-2" 
                title="Exit Shift"
              >
                <LogOut size={16} />
              </button>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto relative bg-[#FAFAFA]">
          <div className="p-8 md:p-12 lg:p-16"><Outlet /></div>
        </div>
      </main>
      <AdminProfileDrawer isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
};

export default ManagerLayout;