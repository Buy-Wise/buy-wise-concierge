import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

/* ─── Inline keyframe styles injected once into the document head ─── */
const KEYFRAME_STYLES = `
@keyframes bw-sweep {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}
@keyframes bw-orbit {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes bw-pulse-scale {
  0%, 100% { transform: scale(1);   opacity: 1;   }
  50%       { transform: scale(1.12); opacity: 0.7; }
}
@keyframes bw-fade-up {
  0%   { opacity: 0; transform: translateY(16px); }
  100% { opacity: 1; transform: translateY(0);    }
}
@keyframes bw-shimmer-bg {
  0%   { background-position: 200% center; }
  100% { background-position: -200% center; }
}
`;

function injectStyles() {
  if (document.getElementById('bw-op-keyframes')) return;
  const style = document.createElement('style');
  style.id = 'bw-op-keyframes';
  style.textContent = KEYFRAME_STYLES;
  document.head.appendChild(style);
}

/* ─── SVG Spinner (pure CSS orbit, no external lib needed) ─── */
function OrbitSpinner({ size = 72 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: '4px solid rgba(212,175,55,0.18)',
        borderTop: '4px solid #D4AF37',
        borderRight: '4px solid rgba(212,175,55,0.55)',
        animation: 'bw-orbit 1s linear infinite',
        flexShrink: 0,
      }}
    />
  );
}

/* ─── Looping shimmer progress bar ─── */
function ShimmerBar() {
  return (
    <div
      style={{
        width: '100%',
        height: 6,
        borderRadius: 99,
        background: 'rgba(255,255,255,0.07)',
        overflow: 'hidden',
        position: 'relative',
        marginTop: 28,
      }}
    >
      {/* Base fill */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, #9a7a1a 0%, #D4AF37 50%, #9a7a1a 100%)',
          backgroundSize: '200% 100%',
          animation: 'bw-shimmer-bg 2s linear infinite',
        }}
      />
      {/* Travelling highlight */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: '40%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.38), transparent)',
          animation: 'bw-sweep 1.6s ease-in-out infinite',
        }}
      />
    </div>
  );
}

/* ─── Elapsed seconds label ─── */
function ElapsedLabel({ seconds }) {
  return (
    <p
      style={{
        fontSize: 12,
        color: 'rgba(212,175,55,0.65)',
        marginTop: 10,
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '0.04em',
      }}
    >
      {seconds > 0 ? `${seconds}s elapsed` : 'Starting…'}
    </p>
  );
}

/* ════════════════════════════════════════════
   Main Component
════════════════════════════════════════════ */
const OrderProcessing = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const isFree  = searchParams.get('free') === 'true';
  const navigate = useNavigate();

  const [status, setStatus]           = useState('GENERATING');
  const [elapsedTime, setElapsedTime] = useState(0);
  // Hold the interval reference so we can kill it cleanly on timeout or unmount
  const intervalRef = useRef(null);

  /* ── inject keyframes once ── */
  useEffect(() => { injectStyles(); }, []);

  useEffect(() => {
    if (!orderId) {
      navigate('/dashboard');
      return;
    }

    const checkStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/reports/${orderId}/status`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();

        if (data.status === 'DELIVERED') {
          navigate(`/order/success?orderId=${orderId}`);
        } else if (data.status === 'GENERATION_FAILED') {
          setStatus('FAILED');
        } else {
          // Treat FREE same as GENERATING for display
          setStatus(data.status === 'FREE' ? 'GENERATING' : data.status);
        }
      } catch (err) {
        console.error('Error polling status:', err);
      }
    };

    checkStatus();
    intervalRef.current = setInterval(() => {
      setElapsedTime(prev => {
        const next = prev + 5;
        // 90-second free-tier cold-boot escape hatch: stop polling cleanly
        if (next >= 90 && intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          console.info('[OrderProcessing] 90s timeout reached — polling stopped, user redirected to dashboard prompt.');
        }
        return next;
      });
      checkStatus();
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [orderId, navigate]);

  /* ─── Shared container styles ─── */
  const wrapStyle = {
    minHeight: 'calc(100vh - 64px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    boxSizing: 'border-box',
  };

  const cardStyle = {
    width: '100%',
    maxWidth: 460,
    background: 'rgba(24,24,27,0.92)',
    border: '1px solid rgba(212,175,55,0.18)',
    borderRadius: 20,
    padding: 'clamp(24px, 6vw, 40px)',
    textAlign: 'center',
    boxShadow: '0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(212,175,55,0.06)',
    animation: 'bw-fade-up 0.45s ease both',
    boxSizing: 'border-box',
  };

  const headingStyle = {
    fontSize: 'clamp(20px, 5vw, 26px)',
    fontWeight: 700,
    color: '#D4AF37',
    marginBottom: 4,
    lineHeight: 1.25,
  };

  const subHeadingStyle = {
    fontSize: 'clamp(15px, 3.5vw, 18px)',
    fontWeight: 600,
    color: '#fff',
    margin: '20px 0 8px',
  };

  const bodyStyle = {
    fontSize: 'clamp(13px, 3vw, 14px)',
    color: 'rgba(161,161,170,0.9)',
    lineHeight: 1.6,
    maxWidth: 340,
    margin: '0 auto',
  };

  const btnStyle = {
    display: 'block',
    width: '100%',
    marginTop: 20,
    padding: '14px 20px',
    background: '#D4AF37',
    color: '#000',
    border: 'none',
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 15,
    cursor: 'pointer',
    touchAction: 'manipulation',
    transition: 'background 0.2s, transform 0.1s',
    WebkitTapHighlightColor: 'transparent',
  };

  /* ─── FAILED STATE ─── */
  if (status === 'FAILED') {
    return (
      <div style={wrapStyle}>
        <div style={cardStyle}>
          <h2 style={headingStyle}>{isFree ? '🎁 Free Report' : 'Payment Successful!'}</h2>

          {/* Warning icon */}
          <div style={{ margin: '24px auto 0', animation: 'bw-pulse-scale 2s ease-in-out infinite', display: 'inline-block' }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>

          <p style={subHeadingStyle}>Generation Hit a Snag</p>
          <p style={bodyStyle}>
            Our research engine encountered a temporary issue. Your order is safely saved and our team has been notified.
            A completed report will appear in your dashboard within 24 hours.
          </p>

          <button
            id="failed-goto-dashboard"
            style={btnStyle}
            onMouseEnter={e => (e.currentTarget.style.background = '#b8972e')}
            onMouseLeave={e => (e.currentTarget.style.background = '#D4AF37')}
            onClick={() => navigate('/dashboard')}
          >
            Go to My Dashboard
          </button>
        </div>
      </div>
    );
  }

  /* ─── TIMEOUT STATE (≥ 90 s) ─── */
  if (elapsedTime >= 90) {
    return (
      <div style={wrapStyle}>
        <div style={cardStyle}>
          <h2 style={headingStyle}>{isFree ? '🎁 Free Report' : 'Payment Successful!'}</h2>

          {/* Clock icon */}
          <div style={{ margin: '24px auto 0', animation: 'bw-pulse-scale 2.4s ease-in-out infinite', display: 'inline-block' }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>

          <p style={subHeadingStyle}>Still Working in the Background</p>
          <p style={bodyStyle}>
            Our free-tier engines are warming up after a cold start. Your report is generating safely — you don't need to wait here.
            It will be ready in your dashboard as soon as it completes.
          </p>

          <button
            id="timeout-goto-dashboard"
            style={btnStyle}
            onMouseEnter={e => (e.currentTarget.style.background = '#b8972e')}
            onMouseLeave={e => (e.currentTarget.style.background = '#D4AF37')}
            onClick={() => navigate('/dashboard')}
          >
            View My Dashboard
          </button>
        </div>
      </div>
    );
  }

  /* ─── GENERATING / POLLING STATE ─── */
  const statusLabel =
    status === 'PENDING'
      ? 'Confirming Payment…'
      : status === 'PAID'
      ? 'Preparing Research…'
      : 'We are generating your report…';

  const statusSub =
    status === 'PENDING'
      ? 'Waiting for final confirmation from Razorpay.'
      : 'This typically takes 30–60 seconds. Please keep this page open.';

  return (
    <div style={wrapStyle}>
      <div style={cardStyle}>
        <h2 style={headingStyle}>{isFree ? '🎁 Free Report Claimed!' : 'Payment Successful!'}</h2>

        {/* Spinner */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28 }}>
          <OrbitSpinner size={64} />
        </div>

        <p style={subHeadingStyle}>{statusLabel}</p>
        <p style={bodyStyle}>{statusSub}</p>

        {/* Looping shimmer bar + elapsed counter */}
        <ShimmerBar />
        <ElapsedLabel seconds={elapsedTime} />
      </div>
    </div>
  );
};

export default OrderProcessing;
