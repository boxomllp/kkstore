'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useStoreSettings } from '@/contexts/StoreContext'
import { firePixelEvent } from '@/hooks/usePixel'
import DeliveryTimeline from './DeliveryTimeline'
import { ArrowLeft, ShieldCheck } from 'lucide-react'

const STATES = ["Maharashtra","Delhi","Karnataka","Tamil Nadu","Uttar Pradesh","Gujarat","Rajasthan"];

interface Props {
  product: any;
  onClose: () => void;
}

export default function BuyNowPopup({ product, onClose }: Props) {
  const stepRef = useRef('form');
  const [step, setStepState] = useState('form');
  const setStep = (s: string) => { stepRef.current = s; setStepState(s); };
  
  const [formData, setFormData] = useState<any>({name: '', phone: '', address_line1: '', address_line2: '', landmark: '', pincode: '', city: '', state: ''});
  const [errors, setErrors] = useState<any>({});
  const [orderId, setOrderId] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const { settings } = useStoreSettings();

  const selectedVariant = product.variants?.enabled ? (product.variants.options.find((o: any) => o.default) || product.variants.options[0]) : null;
  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
    // Body Lock & Back Button Intercept
  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.position = 'fixed';
    document.documentElement.style.width = '100%';
    
    const handleBack = (e: any) => {
      if (stepRef.current !== 'form') { e.preventDefault(); window.history.pushState(null, '', window.location.href); } 
      else { onClose(); }
    };
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handleBack);

    return () => {
      document.documentElement.style.overflow = '';
      document.documentElement.style.position = '';
      document.documentElement.style.width = '';
      window.removeEventListener('popstate', handleBack);
    };
  }, [onClose]);

  // Pincode Auto-fill
  useEffect(() => {
    if (formData.pincode?.length === 6) {
      fetch(`https://api.postalpincode.in/pincode/${formData.pincode}`)
        .then(res => res.json())
        .then(data => {
          if (data[0]?.Status === 'Success') {
            setFormData(prev => ({ ...prev, city: data[0].PostOffice[0].District, state: data[0].PostOffice[0].State }));
          }
        }).catch(() => {});
    }
  }, [formData.pincode]);

  // Resend OTP Timer
  useEffect(() => {
    if (stepRef.current === 'otp' && resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer, step]);

  // Handle Form Submit (Simultaneous API calls)
  const handleBuyNow = async () => {
    setErrors({});
    if (!formData.name || formData.name.length < 3) return setErrors({ name: 'Min 3 chars' });
    if (!formData.phone || formData.phone.length !== 10) return setErrors({ phone: '10 digits required' });
    if (!formData.address_line1 || formData.address_line1.length < 12) return setErrors({ address_line1: 'Min 12 chars' });
    if (!formData.pincode || formData.pincode.length !== 6) return setErrors({ pincode: '6 digits required' });
    if (!formData.city) return setErrors({ city: 'Required' });
    if (!formData.state) return setErrors({ state: 'Required' });

    setLoading(true);
    try {
      const orderPromise = supabase.functions.invoke('create-order', {
        body: { product_id: product.id, product_name: product.name, product_price: currentPrice, variant: selectedVariant?.name || null, ...formData }
      }).then(res => { if (res.data?.id) setOrderId(res.data.id); return res; });

      const otpPromise = supabase.functions.invoke('send-otp', { body: { phone: formData.phone } });

      const [orderRes, otpRes] = await Promise.allSettled([orderPromise, otpPromise]);

      if (orderRes.status === 'rejected' || orderRes.value?.error) {
        alert('Error placing order. Try again.'); setLoading(false); return;
      }
      firePixelEvent('InitiateCheckout', { value: currentPrice, currency: 'INR' });
      setStep('otp'); setResendTimer(30);
    } catch (err) { alert('Something went wrong'); }
    setLoading(false);
  };
    // Handle OTP Verify
  const handleVerify = async () => {
    const otpVal = otp.join('');
    if (otpVal.length !== 4) return;
    setOtpError(''); setLoading(true);
    
    const { data, error } = await supabase.functions.invoke('verify-otp', {
      body: { phone: formData.phone, otp: otpVal, order_id: orderId }
    });
    
    if (error || !data?.success) {
      setOtpError('Incorrect OTP. Please try again.'); setLoading(false); return;
    }
    firePixelEvent('Purchase', { value: currentPrice, currency: 'INR', content_name: product.name });
    window.location.href = '/thank-you'; // Redirect on success
  };

  // Handle Resend OTP
  const handleResend = async () => {
    if (resendTimer > 0) return;
    await supabase.functions.invoke('send-otp', { body: { phone: formData.phone } });
    setResendTimer(30); setOtp(['','','','']); setOtpError('');
  };

  // Form Change Handler
  const handleChange = (e: any) => {
    let val = e.target.value;
    if (e.target.name === 'phone' || e.target.name === 'pincode') val = val.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, [e.target.name]: val }));
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  // OTP Box Change Handler
  const handleOtpChange = (e: any, index: number) => {
    if (e.target.value.length > 1) return;
    const val = e.target.value.replace(/\D/g, '');
    const newOtp = [...otp]; newOtp[index] = val; setOtp(newOtp);
    setOtpError('');
    if (val && index < 3) document.getElementById(`otp-${index + 1}`)?.focus();
    if (index === 3 && val) setTimeout(() => handleVerify(), 200); // Auto-submit
  };
    // RENDER UI
  if (step === 'form') return (
    // CRITICAL MOBILE FIX: Plain fixed div, NO shadcn Dialog
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, backgroundColor: 'white', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div className="p-4 border-b flex items-center gap-3">
        <button onClick={onClose}><ArrowLeft className="w-6 h-6 text-gray-900" /></button>
        <h2 className="text-xl font-bold text-gray-900">{settings.popup_heading || 'Complete Your Order'}</h2>
      </div>
      
      <div className="p-4 space-y-6 pb-24">
        {/* Product Summary */}
        <div className="border p-4 rounded-xl flex gap-4 items-center shadow-sm">
          <img src={product.images?.[0] || ''} className="w-16 h-16 object-cover rounded-lg" alt="" />
          <div>
            <p className="font-bold text-gray-900">{product.name}</p>
            {selectedVariant && <p className="text-sm text-gray-500">{selectedVariant.name}</p>}
            <p className="font-extrabold text-lg text-gray-900">₹{currentPrice}</p>
          </div>
        </div>

        {/* Compact Timeline */}
        <div className="border rounded-xl p-4">
          <DeliveryTimeline readyDays={settings.delivery_ready_days || '1'} deliveryDays={settings.delivery_days || '4'} compact />
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input name="name" value={formData.name} onChange={handleChange} placeholder="Enter your full name" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <span className="px-3 bg-gray-50 text-gray-500 border-r">+91</span>
              <input name="phone" value={formData.phone} onChange={handleChange} maxLength={10} placeholder="10 digit number" className="w-full px-4 py-3 outline-none" />
            </div>
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>
                    <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
            <input name="address_line1" value={formData.address_line1} onChange={handleChange} placeholder="House no, Building, Street" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none" />
            {errors.address_line1 && <p className="text-red-500 text-xs mt-1">{errors.address_line1}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
            <input name="address_line2" value={formData.address_line2} onChange={handleChange} placeholder="Locality, Area (Optional)" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Landmark</label>
            <input name="landmark" value={formData.landmark} onChange={handleChange} placeholder="Near temple, school, etc. (Optional)" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
              <input name="pincode" value={formData.pincode} onChange={handleChange} maxLength={6} placeholder="6 digits" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none" />
              {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input name="city" value={formData.city} onChange={handleChange} placeholder="City" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none" />
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
            <select name="state" value={formData.state} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none bg-white">
              <option value="">Select State</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-green-600" />
            <span className="font-medium">Cash on Delivery (COD) Available</span>
          </div>
                    {/* Sticky Buy Now Button */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg z-10">
            <button
              onClick={handleBuyNow}
              disabled={loading}
              className="w-full bg-[#ea580c] text-white font-extrabold text-[18px] py-4 rounded-[999px] animate-pulse-orange disabled:opacity-50"
            >
              {loading ? 'Placing Order...' : `Buy Now - ₹${currentPrice}`}
            </button>
          </div>
        </div>
      </div>
    );

    // OTP STEP
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, backgroundColor: 'white', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <div className="w-full max-w-sm text-center space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Number</h2>
              <p className="text-gray-500">We've sent a 4-digit OTP to <br /> <span className="font-bold text-gray-900">+91 {formData.phone}</span></p>
            </div>

            {/* OTP Inputs (52x60px) */}
            <div className="flex justify-center gap-3">
              {otp.map((val, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={val}
                  onChange={(e) => handleOtpChange(e, i)}
                  className="w-[52px] h-[60px] text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-[#ea580c] outline-none"
                />
              ))}
            </div>
            
            {otpError && <p className="text-red-500 text-sm font-medium">{otpError}</p>}
                        {/* Resend OTP */}
            <div className="h-6">
              {resendTimer > 0 ? (
                <p className="text-gray-400 text-sm">Resend in {resendTimer}s</p>
              ) : (
                <button onClick={handleResend} className="text-[#ea580c] font-semibold text-sm hover:underline">Resend OTP</button>
              )}
            </div>

            {/* Change Number */}
            <button onClick={() => setStep('form')} className="text-sm text-gray-500 hover:text-gray-900 underline">
              ← Back to form / Change Number
            </button>

            {/* Confirm Order Button */}
            <button
              onClick={handleVerify}
              disabled={otp.join('').length !== 4 || loading}
              className="w-full bg-[#ea580c] text-white font-extrabold text-lg py-4 rounded-[999px] animate-pulse-orange mt-6 disabled:opacity-50 disabled:animate-none"
            >
              {loading ? 'Verifying...' : 'Confirm Order'}
            </button>
          </div>
        </div>
      </div>
    );
  } // End of component
