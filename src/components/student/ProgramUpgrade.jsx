import React, { useState } from 'react';
import { motion } from 'framer-motion';

const PizzaImage = ({ size = 24 }) => (
  <img
    src="/pay/pizza.png"
    alt="Pizza Icon"
    style={{
      width: `${size}px`,
      height: `${size}px`,
      objectFit: 'contain',
      display: 'block',
      flexShrink: 0,
    }}
  />
);

export function ProgramUpgrade({ user, onNavigate }) {
  const [paymentModal, setPaymentModal] = useState({ show: false, type: null });
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponStatus, setCouponStatus] = useState({ type: null, message: '' });

  const couponRules = {
    AAROHAN100: {
      mentorship: 649,
      discovery: 1799
    },
    AAROHAN150: {
      mentorship: 599,
      discovery: 1699
    }
  };

  const paymentOptions = {
    assessment: {
      title: '360° AI Career Assessment',
      subtitle: '',
      amount: 199,
      priceLabel: <>₹ 199 <span style={{ fontSize: '1rem', color: '#4a7a96', fontWeight: 600, marginLeft: '4px' }}>(inc GST)</span></>,
      icon: <PizzaImage size={80} />,
      tag: <span style={{ textDecoration: 'line-through' }}>₹ 499 + GST</span>,
      tagColor: '#b5833d',
      saveBadge: 'Save 60%',
      borderColor: '#b5833d',
      gradientFrom: 'rgba(181, 131, 61, 0.05)',
      accentColor: '#b5833d',
      gradient: 'linear-gradient(135deg, #b5833d 0%, #9c6f30 100%)',
      description: 'This entry-level program provides a scientific "mirror" to help students move beyond academic marks and discover their internal Aptitude DNA',
      features: [
        '360° Multidimensional Assessment - measure what you can do, who you are, and what you want to do, and how you can achieve what you want',
        'Interactive Result and AI-Driven Recommendation Engine',
        '3-month access to AI-Driven Career Mentorship',
        '3-month access to 5000+ Live Job Encyclopedia'
      ],
      whatsappMessage: 'Hi! I have made a payment of ₹199 for the 360° AI Career Assessment plan. Please find my payment screenshot attached.',
      confirmText: "Once our team verifies your payment, we'll activate your 360° AI Career Assessment access. You'll receive a confirmation message."
    },
    mentorship: {
      title: '360° Career Mentorship',
      subtitle: '',
      amount: 749,
      priceLabel: <>₹ 749 <span style={{ fontSize: '1rem', color: '#4a7a96', fontWeight: 600, marginLeft: '4px' }}>(inc GST)</span></>,
      icon: <PizzaImage size={120} />,
      tag: <span style={{ textDecoration: 'line-through' }}>₹ 1,499 + GST</span>,
      tagColor: '#60a8d3',
      saveBadge: 'Save 50%',
      borderColor: '#60a8d3',
      gradientFrom: 'rgba(96, 168, 211, 0.05)',
      accentColor: '#60a8d3',
      gradient: 'linear-gradient(135deg, #60a8d3 0%, #468eb9 100%)',
      description: 'This program helps students with a "Human Compass or a Sherpa" to decode complex data into an actionable strategy',
      features: [
        'All features of 360° AI Career Assessment',
        '30-minute, one-on-one Mentorship Session with our Career Experts',
        '6-month access to AI-Driven Career Mentorship',
        '6-month access to 5000+ Live Job Encyclopedia'
      ],
      whatsappMessage: 'Hi! I have made a payment of ₹749 for the 360° Career Mentorship plan. Please find my payment screenshot attached.',
      confirmText: "Once our team verifies your payment, we'll activate your 360° Career Mentorship plan and confirm your mentorship benefits."
    },
    discovery: {
      title: '360° Complete Career Discovery',
      subtitle: '',
      amount: 1999,
      priceLabel: <>₹ 1,999 <span style={{ fontSize: '1rem', color: '#4a7a96', fontWeight: 600, marginLeft: '4px' }}>(inc GST)</span></>,
      icon: <PizzaImage size={160} />,
      tag: <span style={{ textDecoration: 'line-through' }}>₹ 3,999 + GST</span>,
      tagColor: '#b5833d',
      saveBadge: 'Save 50%',
      borderColor: '#b5833d',
      gradientFrom: 'rgba(181, 131, 61, 0.06)',
      accentColor: '#b5833d',
      gradient: 'linear-gradient(135deg, #b5833d 0%, #9c6f30 100%)',
      description: 'The premium tier offers the full "Lifelong Career Mentorship" ecosystem, connecting students with top-tier industry veterans to guide them',
      features: [
        'All features of 360° AI Career Assessment',
        '60-minute, one-on-one Mentorship Session with our Industry Venteran/Experts',
        '12-month access to AI-Driven Career Mentorship',
        '12-month access to 5000+ Live Job Encyclopedia',
        'Tailored Expert Report Review for the three assessments'
      ],
      whatsappMessage: 'Hi! I have made a payment of ₹1,999 for the 360° Complete Career Discovery plan. Please find my payment screenshot attached.',
      confirmText: "Once our team verifies your payment, we'll activate your 360° Complete Career Discovery plan and share confirmation details."
    }
  };

  const planOrder = ['assessment', 'mentorship', 'discovery'];
  
  const currentPayment = paymentModal.type ? paymentOptions[paymentModal.type] : null;
  const formatINR = (amount) => `₹${amount.toLocaleString('en-IN')}`;

  const resetCouponState = () => {
    setCouponInput('');
    setAppliedCoupon(null);
    setCouponStatus({ type: null, message: '' });
  };

  const openPaymentModal = (planKey) => {
    resetCouponState();
    setPaymentModal({ show: true, type: planKey });
  };

  const closePaymentModal = () => {
    setPaymentModal({ show: false, type: null });
    resetCouponState();
  };

  const baseAmount = currentPayment?.amount || 0;
  const discountedAmount =
    paymentModal.type && appliedCoupon && couponRules[appliedCoupon]?.[paymentModal.type]
      ? couponRules[appliedCoupon][paymentModal.type]
      : baseAmount;
  const finalAmount = discountedAmount;
  const hasDiscount = finalAmount < baseAmount;
  const qrImagePath = `/pay/${finalAmount}.png`;

  const handleApplyCoupon = () => {
    const code = couponInput.trim();

    if (!code) {
      setAppliedCoupon(null);
      setCouponStatus({ type: 'error', message: 'Please enter a coupon code.' });
      return;
    }

    if (paymentModal.type === 'assessment') {
      setAppliedCoupon(null);
      setCouponStatus({ type: 'error', message: 'Coupon not applicable on ₹199 plan.' });
      return;
    }

    if (!couponRules[code] || !couponRules[code][paymentModal.type]) {
      setAppliedCoupon(null);
      setCouponStatus({ type: 'error', message: 'Invalid coupon code.' });
      return;
    }

    setAppliedCoupon(code);
    setCouponStatus({ type: 'success', message: `${code} applied successfully.` });
  };

  const getWhatsappMessage = (planTitle, amount) => (
    `Hi! I have made a payment of ${formatINR(amount)} for the ${planTitle} plan. Please find my payment screenshot attached.`
  );
  
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Upgrade Your Program</h1>
        <p className="page-subtitle">Choose from our official pricing plans and unlock your full career discovery journey</p>
      </div>

      {/* Plan type explanation banner */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto var(--space-24)',
        padding: 'var(--space-16) var(--space-20)',
        background: 'linear-gradient(135deg, rgba(181, 131, 61, 0.08) 0%, rgba(96, 168, 211, 0.08) 50%, rgba(181, 131, 61, 0.08) 100%)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(96, 168, 211, 0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-16)',
        flexWrap: 'wrap'
      }}>
        <i className="fas fa-info-circle" style={{ color: '#60a8d3', fontSize: '20px', flexShrink: 0 }}></i>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <p style={{ margin: 0, fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-base)', color: 'var(--color-text)' }}>
            
          </p>
          <p style={{ margin: 'var(--space-4) 0 0', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            <strong style={{ color: '#b5833d' }}></strong><strong style={{ color: '#60a8d3' }}></strong> <strong style={{ color: '#b5833d' }}></strong>Complete payment, share screenshot on WhatsApp, and your plan gets activated after verification.
          </p>
        </div>
      </div>
      
      <div className="grid grid-3" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {planOrder.map((planKey) => {
          const plan = paymentOptions[planKey];

          return (
            <motion.div
              key={planKey}
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: planOrder.indexOf(planKey) * 0.1, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              whileHover={{ y: -8, boxShadow: `0 20px 40px -12px ${plan.accentColor}30` }}
              style={{
                background: `linear-gradient(135deg, white 0%, ${plan.gradientFrom} 100%)`,
                border: `2px solid ${plan.borderColor}`,
                borderRadius: '20px',
                padding: '0',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'default'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  background: plan.tagColor,
                  color: 'white',
                  padding: '6px 16px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  borderBottomLeftRadius: '12px',
                  letterSpacing: '0.05em',
                  zIndex: 2
                }}
              >
                {plan.tag}
              </div>

              <div className="card-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  marginBottom: '20px',
                  marginTop: '12px',
                  minHeight: '170px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    width: '160px',
                  }}>
                    {plan.icon}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0e2b3c', lineHeight: 1.2 }}>{plan.title}</h3>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                      {plan.subtitle}
                    </span>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  flexWrap: 'wrap',
                  gap: '4px',
                  marginBottom: '8px'
                }}>
                  <span style={{
                    fontSize: '2.2rem',
                    fontWeight: 800,
                    color: plan.accentColor
                  }}>
                    {plan.priceLabel}
                  </span>
                </div>

                <div style={{
                  display: 'inline-block',
                  background: `${plan.accentColor}15`,
                  color: plan.accentColor,
                  padding: '4px 10px',
                  borderRadius: '16px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  marginBottom: '20px',
                  width: 'fit-content'
                }}>
                  {plan.saveBadge}
                </div>

                <div style={{
                  background: `${plan.accentColor}08`,
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '20px',
                  minHeight: '150px' // Increased height
                }}>
                  <p style={{
                    margin: 0,
                    fontSize: '1.1rem', // Increased font size
                    color: '#0e2b3c',
                    lineHeight: 1.6,
                    fontWeight: 500 // Increased font weight
                  }}>
                    {plan.description}
                  </p>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, marginBottom: '24px', flexGrow: 1 }}>
                  {plan.features.map((feature, index) => (
                    <li key={index} style={{
                      marginBottom: '10px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px'
                    }}>
                      <i className="fas fa-check-circle" style={{
                        color: plan.accentColor,
                        marginTop: '2px',
                        fontSize: '1rem',
                        lineHeight: 1.4
                      }}></i>
                      <span style={{ fontSize: '0.95rem', color: '#0e2b3c', lineHeight: 1.5 }}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className="btn w-full"
                  onClick={() => openPaymentModal(planKey)}
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    borderRadius: '12px',
                    background: plan.accentColor,
                    color: 'white',
                    border: 'none',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: `0 4px 12px ${plan.accentColor}40`,
                    transition: 'all 0.2s ease',
                    letterSpacing: '0.3px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: 'auto'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 16px ${plan.accentColor}50`; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 12px ${plan.accentColor}40`; }}
                >
                  Upgrade now
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Current Balance Display */}
      <div style={{
        maxWidth: '1200px',
        margin: 'var(--space-32) auto 0',
        padding: 'var(--space-20)',
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-card-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'var(--space-16)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-16)' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-base)',
            background: 'linear-gradient(135deg, rgba(33, 128, 141, 0.15) 0%, rgba(33, 128, 141, 0.05) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-primary)',
            fontSize: '20px'
          }}>
            <i className="fas fa-coins"></i>
          </div>
          <div>
            <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              Your Current Balance
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-16)', alignItems: 'center', flexWrap: 'wrap' }}>
              <p style={{ margin: 0, fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-xl)', display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
                <i className="fas fa-headset" style={{ color: 'var(--color-primary)', fontSize: '16px' }}></i>
                {user?.counselingCredits || 0} Mentorship {user?.counselingCredits === 1 ? 'Session' : 'Sessions'}
              </p>
              <span style={{ color: 'var(--color-text-secondary)' }}>•</span>
              <p style={{ margin: 0, fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-xl)', display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
                <i className="fas fa-clipboard-check" style={{ color: '#b5833d', fontSize: '16px' }}></i>
                {user?.testCredits || 0} Test {user?.testCredits === 1 ? 'Session' : 'Sessions'}
              </p>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-12)', flexWrap: 'wrap' }}>
          {(user?.counselingCredits || 0) > 0 && (
            <button className="btn btn-secondary" onClick={() => onNavigate && onNavigate('counseling')}>
              <i className="fas fa-calendar-plus" style={{ marginRight: 'var(--space-8)' }}></i>
              Book a Session
            </button>
          )}
          {(user?.testCredits || 0) > 0 && (
            <button className="btn btn-secondary" onClick={() => onNavigate && onNavigate('tests')} style={{ borderColor: '#b5833d', color: '#b5833d' }}>
              <i className="fas fa-clipboard-check" style={{ marginRight: 'var(--space-8)' }}></i>
              Take Assessment
            </button>
          )}
        </div>
      </div>
      
      {/* Payment Modal */}
      {paymentModal.show && currentPayment && (
        <div 
          className="modal-overlay"
          onClick={closePaymentModal}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'var(--space-16)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              maxWidth: '480px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 80px rgba(0, 0, 0, 0.4)',
              animation: 'fadeInScale 0.3s ease-out',
              border: '1px solid var(--color-card-border)'
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: 'var(--space-24)',
              borderBottom: '1px solid var(--color-card-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 'var(--font-size-xl)' }}>Complete Your Payment</h2>
                <p style={{ margin: 'var(--space-4) 0 0', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                  Scan • Pay • Share Screenshot
                </p>
              </div>
              <button 
                onClick={closePaymentModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: 'var(--color-text-secondary)',
                  padding: 'var(--space-8)',
                  lineHeight: 1
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            {/* Modal Body */}
            <div style={{ padding: 'var(--space-24)' }}>
              {/* Price Summary */}
              <div style={{
                background: currentPayment.gradient,
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-20)',
                color: 'white',
                textAlign: 'center',
                marginBottom: 'var(--space-24)'
              }}>
                <p style={{ margin: '0 0 var(--space-4)', opacity: 0.9, fontSize: 'var(--font-size-sm)' }}>
                  Amount to Pay
                </p>
                <p style={{ margin: 0, fontSize: '36px', fontWeight: 'var(--font-weight-bold)' }}>
                  {formatINR(finalAmount)}
                </p>
                {hasDiscount && (
                  <p style={{ margin: 'var(--space-6) 0 0', fontSize: 'var(--font-size-sm)', opacity: 0.9 }}>
                    Original: {formatINR(baseAmount)}
                  </p>
                )}
                <p style={{ margin: 'var(--space-4) 0 0', opacity: 0.9, fontSize: 'var(--font-size-sm)' }}>
                  {currentPayment.description}
                </p>
              </div>

              <div style={{ marginBottom: 'var(--space-24)' }}>
                <p style={{
                  margin: '0 0 var(--space-10)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text)'
                }}>
                  Apply coupon code
                </p>
                <div style={{
                  display: 'flex',
                  gap: 'var(--space-10)',
                  flexWrap: 'wrap'
                }}>
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCouponInput(value);
                      if (appliedCoupon && value.trim() !== appliedCoupon) {
                        setAppliedCoupon(null);
                      }
                      if (couponStatus.message) {
                        setCouponStatus({ type: null, message: '' });
                      }
                    }}
                    placeholder="Apply your coupen code here"
                    style={{
                      flex: 1,
                      minWidth: '220px',
                      border: '1px solid var(--color-card-border)',
                      borderRadius: 'var(--radius-base)',
                      padding: 'var(--space-10) var(--space-12)',
                      fontSize: 'var(--font-size-sm)',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="btn btn-secondary"
                    style={{
                      padding: 'var(--space-10) var(--space-16)',
                      minWidth: '90px'
                    }}
                  >
                    Apply
                  </button>
                </div>
                {couponStatus.message && (
                  <p style={{
                    margin: 'var(--space-8) 0 0',
                    fontSize: 'var(--font-size-sm)',
                    color: couponStatus.type === 'success' ? '#15803d' : '#b91c1c'
                  }}>
                    {couponStatus.message}
                  </p>
                )}
              </div>
              
              {/* QR Code Section */}
              <div style={{
                textAlign: 'center',
                marginBottom: 'var(--space-24)'
              }}>
                <p style={{ 
                  marginBottom: 'var(--space-16)',
                  fontWeight: 'var(--font-weight-semibold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-8)'
                }}>
                  <span style={{
                    background: 'var(--color-primary)',
                    color: 'white',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'var(--font-size-sm)'
                  }}>1</span>
                  Scan this QR code to pay
                </p>
                <div style={{
                  background: 'white',
                  padding: 'var(--space-16)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'inline-block',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                }}>
                  <img 
                    src={qrImagePath}
                    alt="Payment QR Code"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/pay/pay.jpeg';
                    }}
                    style={{
                      width: '200px',
                      height: '200px',
                      objectFit: 'contain',
                      borderRadius: 'var(--radius-base)'
                    }}
                  />
                </div>
                <p style={{ 
                  marginTop: 'var(--space-12)',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-secondary)'
                }}>
                  <i className="fas fa-mobile-alt" style={{ marginRight: '6px' }}></i>
                  Use any UPI app to scan & pay
                </p>
              </div>
              
              {/* Instructions */}
              <div style={{
                background: 'rgba(33, 128, 141, 0.06)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-20)',
                marginBottom: 'var(--space-20)'
              }}>
                <p style={{ 
                  marginBottom: 'var(--space-16)',
                  fontWeight: 'var(--font-weight-semibold)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-8)'
                }}>
                  <span style={{
                    background: 'var(--color-primary)',
                    color: 'white',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'var(--font-size-sm)'
                  }}>2</span>
                  After payment, share screenshot
                </p>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-16)',
                  background: 'var(--color-surface)',
                  padding: 'var(--space-16)',
                  borderRadius: 'var(--radius-base)',
                  border: '1px solid var(--color-card-border)'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: '#25D366',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '24px',
                    flexShrink: 0
                  }}>
                    <i className="fab fa-whatsapp"></i>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 'var(--font-weight-semibold)' }}>
                      Send screenshot to WhatsApp
                    </p>
                    <p style={{ 
                      margin: 'var(--space-4) 0 0', 
                      fontSize: 'var(--font-size-lg)',
                      color: 'var(--color-primary)',
                      fontWeight: 'var(--font-weight-bold)',
                      letterSpacing: '0.5px'
                    }}>
                      8076919360
                    </p>
                  </div>
                  <a 
                    href={`https://wa.me/918076919360?text=${encodeURIComponent(getWhatsappMessage(currentPayment.title, finalAmount))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ 
                      padding: 'var(--space-10) var(--space-16)',
                      fontSize: 'var(--font-size-sm)',
                      textDecoration: 'none'
                    }}
                  >
                    <i className="fab fa-whatsapp" style={{ marginRight: '6px' }}></i>
                    Open
                  </a>
                </div>
              </div>
              
              {/* Final Step */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-12)',
                padding: 'var(--space-16)',
                background: 'rgba(33, 128, 141, 0.06)',
                borderRadius: 'var(--radius-base)'
              }}>
                <span style={{
                  background: currentPayment.accentColor,
                  color: 'white',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--font-size-sm)',
                  flexShrink: 0
                }}>3</span>
                <div>
                  <p style={{ margin: 0, fontWeight: 'var(--font-weight-semibold)' }}>
                    Plan activated within 24 hours
                  </p>
                  <p style={{ 
                    margin: 'var(--space-4) 0 0', 
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-secondary)',
                    lineHeight: '1.5'
                  }}>
                    {currentPayment.confirmText}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div style={{
              padding: 'var(--space-20) var(--space-24)',
              borderTop: '1px solid var(--color-card-border)',
              background: 'rgba(0, 0, 0, 0.02)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-8)',
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--font-size-sm)'
              }}>
                <i className="fas fa-lock"></i>
                <span>Your payment information is secure</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}