import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useVelocity,
  useAnimationFrame,
  useMotionValue
} from 'framer-motion';
import {
  ArrowUpRight,
  MoveRight,
  Plus,
  Check
} from 'lucide-react';

import Footer from '../../components/Footer';

const GALLERY_IMAGES = [
  { id: '01', title: "Merch", subtitle: "Structured Chaos", url: 'https://i.pinimg.com/1200x/e8/e4/a7/e8e4a76077891a8c514a56e2f1743321.jpg' },
  { id: '02', title: "Autmn Wear", subtitle: "Soft Architecture", url: 'https://i.pinimg.com/736x/75/0b/ed/750bed36def6786fb9490f3cb7c76090.jpg' },
  { id: '03', title: "For Her", subtitle: "Essential for her ", url: 'https://i.pinimg.com/736x/99/f1/03/99f1031363b879610dc0f8713d09cc1e.jpg' },
  { id: '04', title: "For Him", subtitle: "Ground Control", url: 'https://littleboxindia.com/cdn/shop/files/Men_Brown_Button_Down_Full_Sleeve_Jacket_720x.webp?v=1769669708' }
];

const wrap = (min, max, v) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-10 right-10 z-[200] flex flex-col gap-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className="bg-[#1A1A1A] text-[#EBE9E0] px-6 py-4 border border-white/10 shadow-2xl flex items-center gap-4 min-w-[300px]"
          >
            <div className="bg-[#9B4819] rounded-full p-1 text-white">
              <Check size={14} strokeWidth={4} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest">{toast.title}</h4>
              <p className="text-[10px] opacity-60 font-medium uppercase tracking-wider">{toast.message}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};


const MagneticButton = ({ children, className, onClick }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const handleMouse = (e) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX, y: middleY });
  };
  const reset = () => setPosition({ x: 0, y: 0 });
  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x * 0.2, y: position.y * 0.2 }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={className}
    >
      {children}
    </motion.button>
  );
};

const ParallaxText = ({ children, baseVelocity = 100 }) => {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false });
  const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);
  const directionFactor = useRef(1);

  useAnimationFrame((t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);
    if (velocityFactor.get() < 0) directionFactor.current = -1;
    else if (velocityFactor.get() > 0) directionFactor.current = 1;
    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="overflow-hidden flex flex-nowrap m-0 select-none py-4">
      <motion.div style={{ x }} className="flex whitespace-nowrap text-6xl md:text-9xl font-black uppercase tracking-tighter">
        {Array(4).fill(children).map((text, i) => (
          <span key={i} className="block mr-12 text-[#1A1A1A] opacity-20">{text} </span>
        ))}
      </motion.div>
    </div>
  );
};

const HorizontalStory = ({ addToast }) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: targetRef });
  const x = useTransform(scrollYProgress, [0, 1], ["1%", "-75%"]);
  
  const navigate = useNavigate(); 

  return (
    <section ref={targetRef} className="relative h-[300vh] bg-[#1A1A1A]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div style={{ x }} className="flex gap-10 pl-10 md:pl-20">
          <div className="flex flex-col justify-center min-w-[400px] md:min-w-[600px] text-[#EBE9E0]">
            <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-6">The Limits</h2>
            <p className="text-xl md:text-2xl font-light opacity-70 max-w-md">
              Fashion should fit your identity, not limit it.
            </p>
          </div>
          
          {GALLERY_IMAGES.map((img) => (
            <div 
              key={img.id} 
              onClick={() => navigate('/products')} 
              className="relative group h-[60vh] md:h-[80vh] w-[80vw] md:w-[45vw] overflow-hidden bg-gray-900 cursor-pointer"
            >
              {}
              <img src={img.url} alt={img.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
              <div className="absolute bottom-0 left-0 p-8 w-full bg-gradient-to-t from-black/90 to-transparent">
                <span className="text-white/50 text-xs font-bold tracking-[0.3em] uppercase mb-2 block">{img.subtitle}</span>
                <h3 className="text-4xl md:text-6xl text-white font-black uppercase tracking-tighter">{img.title}</h3>
              </div>
            </div>
          ))}

          <div className="flex flex-col justify-center min-w-[300px] text-[#EBE9E0] pr-20">
            <MagneticButton
              onClick={() => navigate('/products')}
              className="w-40 h-40 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors cursor-pointer group"
            >
              <div className="flex flex-col items-center">
                <span className="text-xs uppercase tracking-widest font-bold">View All</span>
                <ArrowUpRight className="group-hover:rotate-45 transition-transform" />
              </div>
            </MagneticButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const Home = () => {
  const [isLoading, setIsLoading] = useState(() => {
    const hasLoaded = sessionStorage.getItem('hasLoadedBefore');
    return !hasLoaded;
  });

  const [toasts, setToasts] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const navigate = useNavigate();

  const addToast = (title, message) => {  };
  const removeToast = (id) => {};
  useLayoutEffect(() => {}, []);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const response = await fetch('http://localhost:3000/products?page=1&limit=4');
        const data = await response.json();
        const products = data?.data?.data || data?.data || [];
        setLatestProducts(products);
      } catch (err) {
        console.error("Failed to fetch latest products", err);
      }
    };
    fetchLatest();
  }, []);

  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = 'hidden';

      const exitTimer = setTimeout(() => {
        setIsLoading(false);
        document.body.style.overflow = '';
        sessionStorage.setItem('hasLoadedBefore', 'true');
      }, 3500);

      return () => {
        clearTimeout(exitTimer);
        document.body.style.overflow = '';
      };
    }
  }, [isLoading]);


  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="preloader"
            initial={{ opacity: 1 }}
            exit={{ y: "-100%", transition: { duration: 3, ease: [0.76, 0, 0.24, 1] } }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-black" />

            <video
              autoPlay 
              muted 
              playsInline 
              loop
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src="/gemini_generated_video_935d06f8.mp4" type="video/mp4" />
            </video>
          </motion.div>
        )}
      </AnimatePresence>

      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="relative w-full bg-[#EBE9E0] text-[#1A1A1A] font-sans selection:bg-[#1A1A1A] selection:text-white">

        {/* HERO */}
        <section className="relative w-full h-screen flex flex-col justify-end pb-20 px-6 overflow-hidden">
          <motion.div
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 z-0"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#EBE9E0]" />
            <img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2670&auto=format&fit=crop" className="w-full h-full object-cover opacity-80" alt="Hero" />
          </motion.div>
          <div className="relative z-10 w-full max-w-[1600px] mx-auto">
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 1 }}>
              <p className="text-sm md:text-base font-bold uppercase tracking-[0.3em] mb-4">Est. 2026 — Jaipur</p>
              <h1 className="text-[14vw] leading-[0.8] font-black uppercase tracking-tighter">
                BEYOND <br /> <span className="ml-[10vw] italic font-serif font-light text-[#9B4819]">AESTHETIC</span>
              </h1>
            </motion.div>
          </div>
        </section>

        {}
        <section className="py-40 px-6 md:px-20 bg-[#EBE9E0]">
          <div className="max-w-5xl mx-auto">
            <motion.p
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-medium leading-[1.1] text-[#1A1A1A]"
            >
              Don't be into trends.
              <span className="text-[#9B4819]">Don't make fashion own you, </span> but you decide what you are, what you want to express by the way you dress and the way to live.
            </motion.p>
          </div>
        </section>

        {}
        <div className="bg-[#1A1A1A] py-8 border-y border-white/5">
          <ParallaxText baseVelocity={-3}>NEW SEASON — 2026 — URBAN NOMAD —</ParallaxText>
        </div>

        {}
        <HorizontalStory addToast={addToast} />

        {}
        <section className="py-40 px-6 bg-[#EBE9E0]">
          <div className="flex justify-between items-end mb-16 max-w-[1600px] mx-auto">
            <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter">Latest Drop</h2>
            <div
              onClick={() => addToast("Collections", "Loading full catalog...")}
              className="flex items-center gap-2 cursor-pointer group pb-4"
            >
              <span className="text-xs font-bold uppercase tracking-widest">Explore Collection</span>
              <MoveRight size={18} className="group-hover:translate-x-2 transition-transform" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1600px] mx-auto">
            {latestProducts.map((product, i) => (
              <motion.div
                key={product.id || i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group cursor-pointer"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <div className="relative overflow-hidden mb-6 aspect-[3/4] bg-gray-200">
                  <img
                    src={product.imageUrl || product.image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format'}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format'; }}
                  />
                  <div className="absolute top-6 right-6 bg-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 shadow-lg hover:scale-110 active:scale-95">
                    <Plus size={20} color="#1A1A1A" />
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold uppercase tracking-[0.2em] border border-white/50 px-6 py-3 backdrop-blur-md hover:bg-white hover:text-black transition-colors">View Product</span>
                  </div>
                </div>
                <div className="flex justify-between items-start px-1">
                  <div>
                    <h3 className="text-lg font-bold uppercase tracking-tight group-hover:text-[#9B4819] transition-colors">{product.name}</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mt-1 font-bold">{product.type || 'Collection'}</p>
                  </div>
                  <span className="text-lg font-bold">₹{Number(product.price).toLocaleString()}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {}
        <Footer />
      </div>
    </>
  );
};

export default Home;