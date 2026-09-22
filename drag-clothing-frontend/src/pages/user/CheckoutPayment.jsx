import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from "../../context/CartContext";
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Wallet, Banknote, ShieldCheck, Lock, ArrowRight, Loader2, Check, ShoppingBag, X } from 'lucide-react';
import Confetti from 'react-confetti';
import { orderService, paymentService } from '../../api/services';

// --- SUB-COMPONENT: SUCCESS POPUP ---
const SuccessModal = ({ onClose, orderId }) => {
    const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

    useEffect(() => {
        const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-md p-4"
        >
            <div className="absolute inset-0 pointer-events-none">
                <Confetti
                    width={dimensions.width}
                    height={dimensions.height}
                    numberOfPieces={300}
                    gravity={0.2}
                    recycle={false}
                />
            </div>

            <motion.div
                initial={{ scale: 0.5, y: 100, opacity: 0, rotateX: 45 }}
                animate={{ scale: 1, y: 0, opacity: 1, rotateX: 0 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="bg-white w-full max-w-md relative overflow-hidden shadow-2xl rounded-sm"
            >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#1A1A1A] via-[#9B4819] to-[#1A1A1A]" />

                <div className="p-10 text-center relative z-10">
                    <div className="w-24 h-24 bg-[#25D366]/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                        >
                            <div className="absolute inset-0 bg-[#25D366]/20 rounded-full animate-ping" />
                            <Check size={48} className="text-[#25D366] relative z-10" strokeWidth={4} />
                        </motion.div>
                    </div>

                    <h2 className="text-4xl font-black uppercase tracking-tighter text-[#1A1A1A] mb-2">Success!</h2>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-8 leading-relaxed">
                        Your payment was approved.<br />
                        Order ID: <span className="text-[#9B4819]">#{orderId ? orderId.slice(0, 8) : 'DRG-0000'}</span>
                    </p>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onClose}
                        className="w-full bg-[#1A1A1A] hover:bg-[#9B4819] text-white font-bold py-4 text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 group shadow-lg"
                    >
                        <span>Continue Shopping</span>
                        <ShoppingBag size={16} className="group-hover:-translate-y-1 transition-transform" />
                    </motion.button>
                </div>

                <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            </motion.div>
        </motion.div>
    );
};

// --- SUB-COMPONENT: CREDIT CARD PREVIEW ---
const CardPreview = ({ details }) => (
    <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full aspect-[1.586/1] rounded-2xl overflow-hidden shadow-2xl mb-8 group"
    >
        <div className="absolute inset-0 bg-[#1A1A1A] transition-transform duration-700 group-hover:scale-105">
            <div className="absolute top-0 right-0 w-[150%] h-[150%] bg-gradient-to-bl from-[#9B4819]/40 via-transparent to-transparent rounded-full blur-3xl transform -translate-y-10 translate-x-10" />
        </div>
        <div className="relative z-10 h-full flex flex-col justify-between p-6 text-white/90">
            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Bank of Drag</span>
                    <ShieldCheck size={20} className="mt-2 opacity-80" />
                </div>
                <span className="text-xl font-black italic tracking-tighter">VISA</span>
            </div>
            <div className="space-y-4">
                <div className="flex gap-4 items-center">
                    <div className="w-10 h-7 bg-yellow-500/20 rounded-md border border-yellow-500/40 flex items-center justify-center">
                        <div className="w-6 h-4 bg-yellow-500/40 rounded-sm" />
                    </div>
                    <span className="font-mono text-xl tracking-widest text-shadow-sm">
                        {details.number || '•••• •••• •••• ••••'}
                    </span>
                </div>
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-[8px] uppercase tracking-widest opacity-60 mb-1">Card Holder</p>
                        <p className="font-medium uppercase tracking-wider text-sm">{details.name || 'YOUR NAME'}</p>
                    </div>
                    <div>
                        <p className="text-[8px] uppercase tracking-widest opacity-60 mb-1">Expires</p>
                        <p className="font-mono text-sm">{details.expiry || 'MM/YY'}</p>
                    </div>
                </div>
            </div>
        </div>
    </motion.div>
);

const loadRazorpayScript = () =>
    new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

const CheckoutPayment = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { cart, cartTotal, clearCart } = useCart();

    const [selectedMethod, setSelectedMethod] = useState('card');
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const [orderError, setOrderError] = useState('');
    const [cardDetails, setCardDetails] = useState({ name: '', number: '', expiry: '', cvv: '' });
    const [razorpayReady, setRazorpayReady] = useState(false);

    useEffect(() => {
        if (!state?.addressData && !state?.addressId) {
            navigate('/checkout/address');
        }
    }, [state, navigate]);

    useEffect(() => {
        let isMounted = true;

        loadRazorpayScript().then((loaded) => {
            if (isMounted) {
                setRazorpayReady(loaded);
            }
        });

        return () => {
            isMounted = false;
        };
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;
        if (name === 'number') formattedValue = value.replace(/\W/gi, '').replace(/(.{4})/g, '$1 ').trim();
        if (name === 'expiry') formattedValue = value.replace(/\W/gi, '').replace(/(.{2})/g, '$1/').trim().slice(0, 5);
        setCardDetails(prev => ({ ...prev, [name]: formattedValue }));
    };

    const handlePlaceOrder = async () => {
        setIsProcessing(true);
        setOrderError('');

        try {
            // 1. Create order via backend
            const orderRes = await orderService.createOrder();
            const orderData = orderRes.data?.data || orderRes.data;
            const newOrderId = orderData?.id || orderData?.orderId;
            setOrderId(newOrderId);

            // COD: no gateway flow
            if (selectedMethod === 'cod') {
                await clearCart();
                setOrderSuccess(true);
                return;
            }

            // 2. Create Razorpay order
            if (!razorpayReady || !window.Razorpay) {
                throw new Error('Razorpay SDK not loaded');
            }

            const gatewayRes = await paymentService.createGatewayOrder(newOrderId);
            const gatewayOrder = gatewayRes.data?.data || gatewayRes.data;

            const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
            if (!razorpayKey) {
                throw new Error('Missing VITE_RAZORPAY_KEY_ID in frontend environment');
            }

            await new Promise((resolve, reject) => {
                const rzp = new window.Razorpay({
                    key: razorpayKey,
                    amount: gatewayOrder.amount,
                    currency: gatewayOrder.currency,
                    order_id: gatewayOrder.id,
                    name: 'Drag Clothing',
                    description: 'Order Payment',
                    handler: async (response) => {
                        try {
                            await paymentService.verifyGatewayPayment({
                                orderId: response.razorpay_order_id,
                                paymentId: response.razorpay_payment_id,
                                signature: response.razorpay_signature,
                                appOrderId: newOrderId,
                            });
                            resolve(true);
                        } catch (verifyError) {
                            reject(verifyError);
                        }
                    },
                    prefill: {
                        name: `${state?.addressData?.firstName || ''} ${state?.addressData?.lastName || ''}`.trim(),
                        email: state?.addressData?.email || '',
                        contact: state?.addressData?.phone || '',
                    },
                    notes: {
                        appOrderId: newOrderId,
                    },
                    theme: {
                        color: '#1A1A1A',
                    },
                    modal: {
                        ondismiss: () => reject(new Error('Payment popup closed')),
                    },
                });

                rzp.on('payment.failed', (response) => {
                    const reason = response?.error?.description || 'Payment failed';
                    reject(new Error(reason));
                });

                rzp.open();
            });

            // 3. Clear cart after successful verification
            await clearCart();

            // 4. Show success
            setOrderSuccess(true);
        } catch (err) {
            console.error('Order failed:', err);
            const msg = err.response?.data?.message || 'Failed to place order. Please try again.';
            setOrderError(typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCloseSuccess = () => {
        navigate('/');
    };

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

    // Helper to get cart item fields (backend shape)
    const getItemName = (item) => item.product?.name || item.name || 'Product';
    const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format';
    const getItemImage = (item) => {
        const raw = item.product?.imageUrl || item.product?.image || item.imageUrl || item.image || item.product?.images?.[0] || '';
        if (!raw) return FALLBACK_IMAGE;
        return raw.startsWith('/') ? `http://localhost:3000${raw}` : raw;
    };
    const getItemSize = (item) => item.variant?.size || item.size || '-';
    const getItemPrice = (item) => item.variant?.price || item.product?.price || item.price || 0;
    const getItemQty = (item) => item.quantity || 1;

    return (
        <>
            <AnimatePresence>
                {orderSuccess && <SuccessModal onClose={handleCloseSuccess} orderId={orderId} />}
            </AnimatePresence>

            <div className="min-h-screen pt-28 pb-12 px-6 bg-[#FAFAFA] flex justify-center text-[#1A1A1A]">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12"
                >
                    {/* --- LEFT COL: PAYMENT METHODS --- */}
                    <div className="lg:col-span-7 space-y-8">
                        <motion.div variants={itemVariants}>
                            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2">Secure Pay</h1>
                            <div className="flex items-center gap-2 text-[#9B4819] font-bold text-xs uppercase tracking-widest">
                                <Lock size={12} />
                                <span>Encrypted Transaction</span>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex gap-4 border-b border-gray-200 pb-1">
                            {[
                                { id: 'card', label: 'Credit Card', icon: CreditCard },
                                { id: 'upi', label: 'UPI / Netbank', icon: Wallet },
                                { id: 'cod', label: 'Cash on Del.', icon: Banknote }
                            ].map((method) => (
                                <button
                                    key={method.id}
                                    onClick={() => setSelectedMethod(method.id)}
                                    className={`relative pb-3 px-2 flex items-center gap-2 transition-colors ${selectedMethod === method.id ? 'text-[#1A1A1A]' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <method.icon size={18} />
                                    <span className="text-xs font-bold uppercase tracking-wider">{method.label}</span>
                                    {selectedMethod === method.id && (
                                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1A1A1A]" />
                                    )}
                                </button>
                            ))}
                        </motion.div>

                        {orderError && (
                            <div className="bg-red-50 text-red-600 text-xs font-bold uppercase p-4 rounded-xl text-center border border-red-100">
                                {orderError}
                            </div>
                        )}
                        {selectedMethod !== 'cod' && !razorpayReady && (
                            <div className="bg-yellow-50 text-yellow-700 text-xs font-bold uppercase p-4 rounded-xl text-center border border-yellow-200">
                                Loading payment gateway...
                            </div>
                        )}

                        <motion.div
                            variants={itemVariants}
                            className="bg-white border border-[#E5E5E5] p-6 min-h-[400px] relative overflow-hidden"
                        >
                            <AnimatePresence mode="wait">
                                {selectedMethod === 'card' && (
                                    <motion.div
                                        key="card"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="max-w-md mx-auto"
                                    >
                                        <CardPreview details={cardDetails} />
                                        <div className="space-y-5">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Card Number</label>
                                                <input name="number" maxLength="19" placeholder="0000 0000 0000 0000" onChange={handleInputChange} className="w-full bg-transparent border-b border-gray-200 py-2 font-mono text-lg focus:outline-none focus:border-[#9B4819] transition-colors" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Card Holder Name</label>
                                                <input name="name" placeholder="JOHN DOE" onChange={handleInputChange} className="w-full bg-transparent border-b border-gray-200 py-2 font-bold uppercase text-sm focus:outline-none focus:border-[#9B4819] transition-colors" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-8">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Expiry Date</label>
                                                    <input name="expiry" placeholder="MM/YY" onChange={handleInputChange} className="w-full bg-transparent border-b border-gray-200 py-2 font-mono text-sm focus:outline-none focus:border-[#9B4819] transition-colors" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">CVV</label>
                                                    <input name="cvv" type="password" maxLength="3" placeholder="•••" onChange={handleInputChange} className="w-full bg-transparent border-b border-gray-200 py-2 font-mono text-sm focus:outline-none focus:border-[#9B4819] transition-colors" />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {selectedMethod === 'upi' && (
                                    <motion.div key="upi" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full space-y-4 opacity-50 py-20">
                                        <Wallet size={48} strokeWidth={1} />
                                        <p className="text-xs font-bold uppercase tracking-widest text-center">Redirecting to UPI Gateway secure server upon confirmation.</p>
                                    </motion.div>
                                )}

                                {selectedMethod === 'cod' && (
                                    <motion.div key="cod" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full space-y-4 py-20">
                                        <Banknote size={48} strokeWidth={1} className="text-[#9B4819]" />
                                        <div className="text-center">
                                            <p className="text-sm font-bold uppercase tracking-widest">Cash on Delivery</p>
                                            <p className="text-[10px] opacity-60 mt-2 max-w-xs mx-auto">You will pay in cash upon delivery. Please ensure you have the exact amount.</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    {/* --- RIGHT COL: SUMMARY --- */}
                    <div className="lg:col-span-5 flex flex-col h-full">
                        <motion.div variants={itemVariants} className="bg-[#1A1A1A] text-[#EBE9E0] p-8 flex-1 relative flex flex-col justify-between overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <div>
                                <div className="flex justify-between items-start mb-8 border-b border-white/10 pb-6">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">Invoice To</p>
                                        <p className="text-sm font-bold uppercase mt-1 tracking-wider">
                                            {state?.addressData?.fullName || state?.addressData?.firstName || 'Guest'} {state?.addressData?.lastName || ''}
                                        </p>
                                        <p className="text-xs opacity-70 mt-1">
                                            {state?.addressData?.city || ''}{state?.addressData?.zip ? `, ${state.addressData.zip}` : ''}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">Order Total</p>
                                        <p className="text-2xl font-black tracking-tighter mt-1">₹{cartTotal}</p>
                                    </div>
                                </div>
                                {/* Items List */}
                                <div className="space-y-4 mb-8">
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Your Selection</p>
                                    <div className="max-h-[200px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
                                        {cart.map((item, idx) => (
                                            <div key={idx} className="flex gap-4 items-center bg-white/5 p-3">
                                                <div className="w-10 h-12 bg-white/10 overflow-hidden">
                                                    <img src={getItemImage(item)} alt="" className="w-full h-full object-cover opacity-80" onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs font-bold uppercase tracking-wider">{getItemName(item)}</p>
                                                    <p className="text-[10px] opacity-50">Size: {getItemSize(item)} / Qty: {getItemQty(item)}</p>
                                                </div>
                                                <p className="text-xs font-bold opacity-80">₹{getItemPrice(item) * getItemQty(item)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Pay Button */}
                            <div className="space-y-4 z-10">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest opacity-60">
                                    <span>Subtotal</span>
                                    <span>₹{cartTotal}</span>
                                </div>
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest opacity-60">
                                    <span>Shipping</span>
                                    <span>Free</span>
                                </div>
                                <div className="h-px bg-white/20 my-4" />

                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={isProcessing || cart.length === 0 || (selectedMethod !== 'cod' && !razorpayReady)}
                                    className="group relative w-full h-16 bg-white text-black font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center overflow-hidden hover:bg-[#9B4819] hover:text-white transition-colors duration-500 disabled:opacity-80 disabled:cursor-not-allowed"
                                >
                                    <span className={`absolute transition-transform duration-500 flex items-center gap-2 ${isProcessing ? '-translate-y-10' : 'translate-y-0'}`}>
                                        Confirm Order <ArrowRight size={16} />
                                    </span>
                                    <span className={`absolute transition-transform duration-500 flex items-center gap-2 ${isProcessing ? 'translate-y-0' : 'translate-y-10'}`}>
                                        <Loader2 size={18} className="animate-spin" /> Processing
                                    </span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default CheckoutPayment;
