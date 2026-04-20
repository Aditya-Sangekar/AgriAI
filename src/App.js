// ============================================================
// AgriAI Advisor — Team Dark Knight
// Paste into StackBlitz (stackblitz.com/fork/react) → App.js
// ============================================================
//
// 🔑 ADD YOUR API KEYS HERE — just replace the empty strings:
// ============================================================

const HF_TOKEN = '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'; // Your Hugging Face token
const GEMINI_KEY = 'AIzaSyD5RIOcMnpFywNB1cGrmIFL2doB2kTvsmY'; // Your Google Gemini key
const GROQ_KEY = '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'; // Your Groq key (used if Gemini is empty)

// ============================================================
// THAT'S IT! The rest of the app is automatic.
// ============================================================

import React, { useState, useEffect, useRef } from 'react';

// ── COLOUR PALETTE ──
const C = {
  pageBg: '#F0F4F0',
  cardBg: '#FFFFFF',
  border: '#E2E8E2',
  green: '#2D6A4F',
  greenDark: '#1A4332',
  greenLight: '#B7E4C7',
  greenPale: '#F0FAF4',
  text: '#111827',
  muted: '#6B7280',
  white: '#FFFFFF',
  red: '#DC2626',
  redBg: '#FEF2F2',
  orange: '#D97706',
  orangeBg: '#FFFBEB',
  blue: '#2563EB',
  blueBg: '#EFF6FF',
  success: '#16A34A',
  successBg: '#F0FDF4',
  grey: '#9CA3AF',
  greyBg: '#F3F4F6',
};

// ── DISEASE LOOKUP TABLE ──
const DISEASE_MAP = {
  Apple___Apple_scab: { crop: 'Apple', disease: 'Apple Scab', type: 'fungal' },
  Apple___Black_rot: { crop: 'Apple', disease: 'Black Rot', type: 'fungal' },
  Apple___Cedar_apple_rust: {
    crop: 'Apple',
    disease: 'Cedar Apple Rust',
    type: 'fungal',
  },
  Apple___healthy: { crop: 'Apple', disease: 'Healthy', type: 'none' },
  Cherry___Powdery_mildew: {
    crop: 'Cherry',
    disease: 'Powdery Mildew',
    type: 'fungal',
  },
  Cherry___healthy: { crop: 'Cherry', disease: 'Healthy', type: 'none' },
  'Corn_(maize)___Common_rust_': {
    crop: 'Corn',
    disease: 'Common Rust',
    type: 'fungal',
  },
  'Corn_(maize)___Northern_Leaf_Blight': {
    crop: 'Corn',
    disease: 'Northern Leaf Blight',
    type: 'fungal',
  },
  'Corn_(maize)___healthy': { crop: 'Corn', disease: 'Healthy', type: 'none' },
  Grape___Black_rot: { crop: 'Grape', disease: 'Black Rot', type: 'fungal' },
  'Grape___Esca_(Black_Measles)': {
    crop: 'Grape',
    disease: 'Esca Disease',
    type: 'fungal',
  },
  'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)': {
    crop: 'Grape',
    disease: 'Leaf Blight',
    type: 'bacterial',
  },
  Grape___healthy: { crop: 'Grape', disease: 'Healthy', type: 'none' },
  Peach___Bacterial_spot: {
    crop: 'Peach',
    disease: 'Bacterial Spot',
    type: 'bacterial',
  },
  Peach___healthy: { crop: 'Peach', disease: 'Healthy', type: 'none' },
  'Pepper,_bell___Bacterial_spot': {
    crop: 'Pepper',
    disease: 'Bacterial Spot',
    type: 'bacterial',
  },
  'Pepper,_bell___healthy': {
    crop: 'Pepper',
    disease: 'Healthy',
    type: 'none',
  },
  Potato___Early_blight: {
    crop: 'Potato',
    disease: 'Early Blight',
    type: 'fungal',
  },
  Potato___Late_blight: {
    crop: 'Potato',
    disease: 'Late Blight',
    type: 'fungal',
  },
  Potato___healthy: { crop: 'Potato', disease: 'Healthy', type: 'none' },
  Soybean___healthy: { crop: 'Soybean', disease: 'Healthy', type: 'none' },
  Squash___Powdery_mildew: {
    crop: 'Squash',
    disease: 'Powdery Mildew',
    type: 'fungal',
  },
  Strawberry___Leaf_scorch: {
    crop: 'Strawberry',
    disease: 'Leaf Scorch',
    type: 'fungal',
  },
  Strawberry___healthy: {
    crop: 'Strawberry',
    disease: 'Healthy',
    type: 'none',
  },
  Tomato___Bacterial_spot: {
    crop: 'Tomato',
    disease: 'Bacterial Spot',
    type: 'bacterial',
  },
  Tomato___Early_blight: {
    crop: 'Tomato',
    disease: 'Early Blight',
    type: 'fungal',
  },
  Tomato___Late_blight: {
    crop: 'Tomato',
    disease: 'Late Blight',
    type: 'fungal',
  },
  Tomato___Leaf_Mold: { crop: 'Tomato', disease: 'Leaf Mold', type: 'fungal' },
  Tomato___Septoria_leaf_spot: {
    crop: 'Tomato',
    disease: 'Septoria Leaf Spot',
    type: 'fungal',
  },
  'Tomato___Spider_mites Two-spotted_spider_mite': {
    crop: 'Tomato',
    disease: 'Spider Mites',
    type: 'pest',
  },
  Tomato___Target_Spot: {
    crop: 'Tomato',
    disease: 'Target Spot',
    type: 'fungal',
  },
  Tomato___Tomato_Yellow_Leaf_Curl_Virus: {
    crop: 'Tomato',
    disease: 'Yellow Leaf Curl Virus',
    type: 'viral',
  },
  Tomato___Tomato_mosaic_virus: {
    crop: 'Tomato',
    disease: 'Mosaic Virus',
    type: 'viral',
  },
  Tomato___healthy: { crop: 'Tomato', disease: 'Healthy', type: 'none' },
};

// ── HELPERS ──
function getWeatherEmoji(code) {
  if (code === 0) return '☀️';
  if (code <= 3) return '🌤️';
  if (code <= 48) return '🌫️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌦️';
  if (code >= 95) return '⛈️';
  return '🌡️';
}

function getWeatherLabel(code) {
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Partly Cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 67) return 'Rainy';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Mixed';
}

function safeParseJSON(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {}
  try {
    const m = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (m) return JSON.parse(m[1].trim());
    const s = text.indexOf('{'),
      e = text.lastIndexOf('}');
    if (s !== -1 && e !== -1) return JSON.parse(text.slice(s, e + 1));
  } catch {}
  return null;
}

function buildWeatherSummary(w) {
  return w.daily.time
    .map(
      (d, i) =>
        `Day ${i + 1} (${d}): Max ${w.daily.temperature_2m_max[i]}°C, Min ${
          w.daily.temperature_2m_min[i]
        }°C, Rain ${w.daily.precipitation_probability_max[i]}%`
    )
    .join('. ');
}

async function callAI(prompt) {
  // Try Gemini first, then Groq as fallback
  if (GEMINI_KEY) {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );
    if (r.status === 429) throw new Error('RATE_LIMIT');
    if (!r.ok) throw new Error(`AI error ${r.status}`);
    const d = await r.json();
    const t = d?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!t) throw new Error('EMPTY');
    return t;
  }
  if (GROQ_KEY) {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert agricultural scientist for Indian farming, Maharashtra.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.4,
        max_tokens: 1500,
      }),
    });
    if (r.status === 429) throw new Error('RATE_LIMIT');
    if (!r.ok) throw new Error(`AI error ${r.status}`);
    const d = await r.json();
    const t = d?.choices?.[0]?.message?.content;
    if (!t) throw new Error('EMPTY');
    return t;
  }
  throw new Error('NO_KEY');
}

// ── SMALL UI ATOMS ──

function Pill({ text, bg, color, size = 'sm' }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: bg,
        color: color,
        borderRadius: '99px',
        padding: size === 'lg' ? '6px 16px' : '3px 10px',
        fontSize: size === 'lg' ? '13px' : '11px',
        fontWeight: '600',
        fontFamily: 'DM Sans, sans-serif',
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </span>
  );
}

function Spinner() {
  return (
    <span
      style={{
        display: 'inline-block',
        width: '16px',
        height: '16px',
        border: `2px solid rgba(255,255,255,0.3)`,
        borderTopColor: '#fff',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }}
    />
  );
}

// Animated loading dots "Analyzing..."
function LoadingDots({ label }) {
  const [dots, setDots] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setDots((d) => (d + 1) % 4), 450);
    return () => clearInterval(t);
  }, []);
  return (
    <span
      style={{
        fontFamily: 'DM Sans, sans-serif',
        fontSize: '14px',
        color: C.success,
      }}
    >
      {label}
      {'.'.repeat(dots)}
    </span>
  );
}

// Confidence bar (fills from 0 to confidence%)
function ConfidenceBar({ value }) {
  const color = value >= 80 ? C.success : value >= 50 ? C.orange : C.red;
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '4px',
        }}
      >
        <span
          style={{
            fontSize: '12px',
            color: C.muted,
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          Confidence
        </span>
        <span
          style={{
            fontSize: '12px',
            fontWeight: '700',
            color,
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          {value}%
        </span>
      </div>
      <div
        style={{
          height: '6px',
          background: C.greyBg,
          borderRadius: '99px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${value}%`,
            background:
              value >= 80 ? C.success : value >= 50 ? C.orange : C.red,
            borderRadius: '99px',
            transition: 'width 0.8s ease',
          }}
        />
      </div>
    </div>
  );
}

// Urgency indicator with icon
function UrgencyBadge({ level }) {
  const map = {
    High: { bg: '#FEF2F2', color: C.red, icon: '🔴', label: 'High Risk' },
    Medium: {
      bg: C.orangeBg,
      color: C.orange,
      icon: '🟡',
      label: 'Medium Risk',
    },
    Low: { bg: C.successBg, color: C.success, icon: '🟢', label: 'Low Risk' },
    None: { bg: C.successBg, color: C.success, icon: '✅', label: 'Healthy' },
  };
  const s = map[level] || map.Medium;
  return (
    <Pill text={`${s.icon} ${s.label}`} bg={s.bg} color={s.color} size="lg" />
  );
}

// Expandable section (click to toggle open/close)
function Expandable({ icon, title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      style={{
        borderRadius: '10px',
        border: `1px solid ${C.border}`,
        overflow: 'hidden',
        marginBottom: '10px',
      }}
    >
      <button
        onClick={() => setOpen((p) => !p)}
        style={{
          width: '100%',
          background: open ? C.greenPale : C.cardBg,
          border: 'none',
          padding: '13px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          fontFamily: 'DM Sans, sans-serif',
        }}
      >
        <span
          style={{
            fontSize: '14px',
            fontWeight: '600',
            color: C.text,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>{icon}</span>
          {title}
        </span>
        <span
          style={{
            fontSize: '11px',
            color: open ? C.green : C.muted,
            fontWeight: '600',
            fontFamily: 'DM Sans, sans-serif',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            display: 'inline-block',
            transition: 'transform 0.2s',
          }}
        >
          ▼
        </span>
      </button>
      {open && (
        <div
          style={{
            padding: '0 16px 14px 16px',
            borderTop: `1px solid ${C.border}`,
            background: C.cardBg,
          }}
        >
          <div style={{ height: '12px' }} />
          {children}
        </div>
      )}
    </div>
  );
}

// A single step in a multi-step progress indicator
function StepIndicator({ steps, current }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0px',
        marginBottom: '24px',
      }}
    >
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              flex: i < steps.length - 1 ? 1 : 'none',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: done ? C.green : active ? C.green : C.greyBg,
                  border: `2px solid ${done || active ? C.green : C.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: done || active ? C.white : C.muted,
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                {done ? '✓' : i + 1}
              </div>
              <span
                style={{
                  fontSize: '10px',
                  color: active ? C.green : C.muted,
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: active ? '600' : '400',
                  whiteSpace: 'nowrap',
                }}
              >
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: '2px',
                  background: done ? C.green : C.border,
                  margin: '0 4px',
                  marginBottom: '18px',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Green primary button
function Btn({ onClick, disabled, loading, children, full, outline }) {
  const [hov, setHov] = useState(false);
  if (outline)
    return (
      <button
        onClick={onClick}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: hov ? C.greenPale : 'transparent',
          color: C.green,
          border: `1.5px solid ${C.green}`,
          borderRadius: '10px',
          padding: '10px 20px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          fontFamily: 'DM Sans, sans-serif',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          width: full ? '100%' : 'auto',
          justifyContent: 'center',
        }}
      >
        {children}
      </button>
    );
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      onMouseEnter={() => !disabled && setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: disabled ? C.grey : hov ? C.greenDark : C.green,
        color: C.white,
        border: 'none',
        borderRadius: '10px',
        padding: '11px 22px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'DM Sans, sans-serif',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        width: full ? '100%' : 'auto',
        justifyContent: 'center',
        boxShadow: disabled
          ? 'none'
          : hov
          ? '0 4px 12px rgba(45,106,79,0.35)'
          : '0 2px 6px rgba(45,106,79,0.2)',
      }}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

// ── GLOBAL STYLES (injected once) ──
function GlobalStyles() {
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap');
      * { box-sizing: border-box; }
      body { margin:0; background:${C.pageBg}; font-family:'DM Sans',sans-serif; }
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
      @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
      .fade-up { animation: fadeUp 0.35s ease forwards; }
      @media print { #print-hide { display:none !important; } }
    `;
    document.head.appendChild(style);
  }, []);
  return null;
}

// ── HEADER ──
function Header({ onReset }) {
  const [hov, setHov] = useState(false);
  return (
    <header
      style={{
        background: `linear-gradient(135deg, ${C.greenDark} 0%, ${C.green} 100%)`,
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
          }}
        >
          🌾
        </div>
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: '700',
              color: C.white,
              fontFamily: 'DM Sans, sans-serif',
              letterSpacing: '-0.3px',
            }}
          >
            AgriAI Advisor
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: '12px',
              color: 'rgba(255,255,255,0.75)',
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            Smart Farming Assistant · Maharashtra
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={onReset}
          onMouseEnter={() => setHov(true)}
          onMouseLeave={() => setHov(false)}
          style={{
            background: hov
              ? 'rgba(255,255,255,0.2)'
              : 'rgba(255,255,255,0.12)',
            color: C.white,
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '12px',
            cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: '500',
          }}
        >
          ↺ Reset
        </button>
        <div
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '20px',
            padding: '6px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>🛡️</span>
          <span
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: C.white,
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            Team Dark Knight
          </span>
        </div>
      </div>
    </header>
  );
}

// ── TAB BAR ──
function TabBar({ active, onChange }) {
  const tabs = [
    { id: 'disease', icon: '🔬', label: 'Disease Detect' },
    { id: 'weather', icon: '🌤️', label: 'Weather' },
    { id: 'irrigation', icon: '💧', label: 'Irrigation Plan' },
  ];
  return (
    <div
      style={{
        background: C.cardBg,
        display: 'flex',
        borderBottom: `1px solid ${C.border}`,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        overflowX: 'auto',
      }}
    >
      {tabs.map((t) => {
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            style={{
              flex: 1,
              minWidth: '110px',
              background: 'transparent',
              border: 'none',
              borderBottom: isActive
                ? `3px solid ${C.green}`
                : '3px solid transparent',
              padding: '14px 8px 11px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: '18px' }}>{t.icon}</span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: isActive ? '700' : '500',
                color: isActive ? C.green : C.muted,
                fontFamily: 'DM Sans, sans-serif',
                whiteSpace: 'nowrap',
              }}
            >
              {t.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════
// FEATURE 1 — DISEASE DETECTION
// ══════════════════════════════════════════════
function DiseaseTab({ onResult }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [step, setStep] = useState(0); // 0=idle,1=reading,2=detecting,3=advice,4=done
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loadingMsg, setLoadingMsg] = useState('');
  const fileRef = useRef(null);

  const STEPS = [
    'Upload',
    'Read Image',
    'Detect Disease',
    'Get Advice',
    'Done',
  ];

  function handleFile(f) {
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      setError('Photo is too large. Please use an image under 5MB.');
      return;
    }
    setError('');
    setResult(null);
    setStep(0);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }

  function handleClear() {
    setFile(null);
    setPreview(null);
    setError('');
    setResult(null);
    setStep(0);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function handleDetect() {
    if (!file) return;
    setError('');
    setResult(null);

    try {
      // ── STEP 1: Read image as Base64 ──
      // Base64 converts image into a long text string
      // This is what HuggingFace PlantVillage model accepts
      setStep(1);
      setLoadingMsg('⏳ Reading image...');
      const base64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result.split(',')[1]); // remove "data:image/jpeg;base64," prefix
        r.onerror = rej;
        r.readAsDataURL(file); // reads file as base64 string
      });

      // ── STEP 2: Send to HuggingFace PlantVillage Model ──
      // allorigins.win is a free proxy that bypasses browser CORS restriction
      // The actual AI model is the PlantVillage trained model on HuggingFace
      setStep(2);
      setLoadingMsg('⏳ PlantVillage AI is scanning your leaf...');

      // ── STEP 2: Groq Vision identifies disease ──
      // Groq reads the image and maps to PlantVillage disease classes
      setStep(2);
      setLoadingMsg('⏳ AI is scanning your leaf photo...');

      const visionRes = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${GROQ_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'meta-llama/llama-4-scout-17b-16e-instruct',
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:image/jpeg;base64,${base64}`,
                    },
                  },
                  {
                    type: 'text',
                    text: `You are a plant disease expert trained on PlantVillage dataset.
Look at this leaf carefully. Identify the crop and disease.
Reply ONLY in this exact JSON, no other text:
{
  "label": "Tomato___Late_blight",
  "score": 0.92
}
Use ONLY these exact label formats from PlantVillage:
Tomato___Late_blight, Tomato___Early_blight, Tomato___Leaf_Mold,
Tomato___Bacterial_spot, Tomato___healthy,
Potato___Late_blight, Potato___Early_blight, Potato___healthy,
Corn_(maize)___Common_rust_, Corn_(maize)___Northern_Leaf_Blight, Corn_(maize)___healthy,
Grape___Black_rot, Grape___healthy,
Apple___Apple_scab, Apple___Black_rot, Apple___healthy,
Pepper,_bell___Bacterial_spot, Pepper,_bell___healthy,
Soybean___healthy, Squash___Powdery_mildew,
Strawberry___Leaf_scorch, Strawberry___healthy
If unsure pick closest match. Score = your confidence 0 to 1.`,
                  },
                ],
              },
            ],
            temperature: 0.1,
            max_tokens: 100,
          }),
        }
      );

      if (!visionRes.ok) {
        const e = await visionRes.json().catch(() => ({}));
        throw new Error(
          e?.error?.message || 'Vision scan failed. Check Groq key.'
        );
      }

      const visionData = await visionRes.json();
      const visionText = visionData?.choices?.[0]?.message?.content;
      const detected = safeParseJSON(visionText);

      if (!detected)
        throw new Error('Could not read image. Try a clearer leaf photo.');

      // Now use PlantVillage label format — same as HuggingFace would return
      const preds = [{ label: detected.label, score: detected.score }];
      const top = preds[0];
      const rawLabel = top.label;
      const confidence = Math.round(top.score * 100);
      setConfidence(confidence);

      const known = DISEASE_MAP[rawLabel];
      const cropName =
        known?.crop || rawLabel.split('___')[0].replace(/_/g, ' ');
      const diseaseName =
        known?.disease ||
        (rawLabel.split('___')[1] || rawLabel).replace(/_/g, ' ');
      const isHealthy = diseaseName === 'Healthy';

      // ── STEP 3: If healthy, skip AI advice ──
      if (isHealthy) {
        const healthyResult = {
          cropName,
          diseaseName: 'Healthy ✅',
          urgencyLevel: 'None',
          urgencyReason: 'Your plant looks healthy! No disease detected.',
          symptoms: ['No visible disease symptoms found.'],
          organicTreatments: [
            'Continue your regular care routine.',
            'Water consistently at the base.',
          ],
          chemicalTreatments: ['No chemical treatment required.'],
          preventionTips: [
            'Space plants well for air flow.',
            'Water at the base, not the leaves.',
            'Inspect every 2-3 days for early signs.',
          ],
          isFungal: false,
          isBacterial: false,
          isViral: false,
          spreadRisk: 'None',
        };
        setStep(4);
        setResult(healthyResult);
        onResult?.(healthyResult, confidence);
        return;
      }

      // ── STEP 4: Send disease to Groq for treatment advice ──
      setStep(3);
      setLoadingMsg('⏳ Generating Maharashtra-specific treatment advice...');

      const advicePrompt = `You are an expert agricultural scientist for Maharashtra, India.
Crop: ${cropName}, Disease: ${diseaseName}.
Reply ONLY in this JSON format, no other text:
{
  "cropName": "${cropName}",
  "diseaseName": "${diseaseName}",
  "urgencyLevel": "High",
  "urgencyReason": "one sentence why",
  "symptoms": ["symptom 1", "symptom 2", "symptom 3"],
  "organicTreatments": ["neem or local remedy 1", "remedy 2", "remedy 3"],
  "chemicalTreatments": ["chemical + dosage + Maharashtra brand", "treatment 2", "treatment 3"],
  "preventionTips": ["tip 1", "tip 2", "tip 3"],
  "isFungal": true,
  "isBacterial": false,
  "isViral": false,
  "spreadRisk": "High"
}`;

      const adviceReply = await callAI(advicePrompt);
      const parsed = safeParseJSON(adviceReply) || {
        cropName,
        diseaseName,
        urgencyLevel: 'Medium',
        urgencyReason:
          'Disease detected. Please consult your local agricultural officer.',
        symptoms: ['Visible leaf damage detected.'],
        organicTreatments: ['Apply neem oil spray.'],
        chemicalTreatments: ['Consult local agri shop for fungicide.'],
        preventionTips: [
          'Monitor crop regularly.',
          'Remove infected leaves immediately.',
        ],
        isFungal: known?.type === 'fungal',
        isBacterial: known?.type === 'bacterial',
        isViral: known?.type === 'viral',
        spreadRisk: 'Medium',
      };

      setStep(4);
      setResult(parsed);
      onResult?.(parsed, confidence);
    } catch (err) {
      setStep(0);
      if (err.message === 'RATE_LIMIT')
        setError('Too many requests. Wait 1 minute and try again.');
      else if (!navigator.onLine)
        setError('No internet connection. Please check and try again.');
      else setError(err.message);
    }
  }

  return (
    <div className="fade-up">
      {/* Progress steps */}
      {step > 0 && <StepIndicator steps={STEPS} current={step} />}

      {/* Upload card */}
      <div style={{ ...card, marginBottom: '16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: C.greenPale,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            🔬
          </div>
          <div>
            <h2 style={h2}>Crop Disease Detection</h2>
            <p style={sub}>Upload a leaf photo for instant AI analysis</p>
          </div>
        </div>

        {/* Drop zone */}
        <div
          onClick={() => !file && fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${
              dragging ? C.green : file ? C.green : C.border
            }`,
            borderRadius: '14px',
            padding: preview ? '12px' : '40px 20px',
            textAlign: 'center',
            cursor: file ? 'default' : 'pointer',
            background: dragging ? C.greenPale : file ? C.successBg : C.greyBg,
            marginBottom: '16px',
          }}
        >
          {preview ? (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img
                src={preview}
                alt="Leaf preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '240px',
                  borderRadius: '10px',
                  objectFit: 'contain',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'rgba(255,255,255,0.9)',
                  borderRadius: '20px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: C.green,
                }}
              >
                ✅ Photo ready
              </div>
            </div>
          ) : (
            <>
              <div
                style={{
                  fontSize: '48px',
                  marginBottom: '10px',
                  opacity: dragging ? 0.6 : 1,
                }}
              >
                📸
              </div>
              <p
                style={{
                  margin: '0 0 4px 0',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: C.text,
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                {dragging
                  ? 'Drop it here!'
                  : 'Tap to upload or drag a leaf photo'}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: '12px',
                  color: C.muted,
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                JPG · PNG · WEBP · Max 5MB
              </p>
            </>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFile(e.target.files[0])}
          style={{ display: 'none' }}
        />

        {file && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
              background: C.greyBg,
              borderRadius: '8px',
              padding: '8px 12px',
            }}
          >
            <span
              style={{
                fontSize: '13px',
                color: C.muted,
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              📄 {file.name} · {(file.size / 1024).toFixed(0)} KB
            </span>
            <button
              onClick={handleClear}
              style={{
                background: 'none',
                border: 'none',
                color: C.red,
                fontSize: '12px',
                cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: '600',
              }}
            >
              ✕ Remove
            </button>
          </div>
        )}

        <p
          style={{
            fontSize: '12px',
            color: C.muted,
            fontFamily: 'DM Sans, sans-serif',
            margin: '0 0 14px 0',
          }}
        >
          💡 Best results: close-up of single leaf · good lighting · sharp focus
        </p>

        {countdown > 0 && (
          <div
            style={{
              background: C.orangeBg,
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '12px',
              fontSize: '13px',
              color: C.orange,
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            ⏳ System warming up... retrying in {countdown}s
          </div>
        )}

        {error && (
          <div
            style={{
              background: C.redBg,
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '12px',
              fontSize: '13px',
              color: C.red,
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {step > 0 && step < 4 && (
          <div
            style={{
              background: C.successBg,
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <LoadingDots
              label={
                step === 1
                  ? 'Reading image'
                  : step === 2
                  ? 'Scanning for diseases'
                  : 'Generating farm advice'
              }
            />
          </div>
        )}

        <Btn
          onClick={handleDetect}
          disabled={!file || (step > 0 && step < 4)}
          loading={step > 0 && step < 4}
        >
          {step > 0 && step < 4 ? 'Analysing...' : '🔬 Detect Disease'}
        </Btn>
      </div>

      {/* Result card */}
      {result && (
        <DiseaseResult
          result={result}
          confidence={confidence}
          onReset={handleClear}
        />
      )}
    </div>
  );
}

function DiseaseResult({ result, confidence, onReset }) {
  const isHealthy = result.urgencyLevel === 'None';
  return (
    <div className="fade-up" style={{ ...card }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '16px',
        }}
      >
        <div>
          <h3
            style={{
              margin: '0 0 4px 0',
              fontSize: '20px',
              fontWeight: '700',
              color: C.text,
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            {result.cropName}
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: '15px',
              color: isHealthy ? C.success : C.red,
              fontWeight: '600',
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            {result.diseaseName}
          </p>
        </div>
        <UrgencyBadge level={result.urgencyLevel} />
      </div>

      {/* Confidence bar */}
      <div style={{ marginBottom: '16px' }}>
        <ConfidenceBar value={confidence} />
      </div>

      {/* Urgency reason */}
      {result.urgencyReason && (
        <div
          style={{
            background: isHealthy ? C.successBg : C.redBg,
            borderRadius: '10px',
            padding: '12px 14px',
            marginBottom: '16px',
            borderLeft: `4px solid ${isHealthy ? C.success : C.red}`,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '13px',
              color: isHealthy ? C.success : C.red,
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: '500',
            }}
          >
            {result.urgencyReason}
          </p>
        </div>
      )}

      {/* Disease type chips */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          marginBottom: '16px',
        }}
      >
        {result.isFungal && (
          <Pill text="🍄 Fungal" bg="#FEF3C7" color="#92400E" />
        )}
        {result.isBacterial && (
          <Pill text="🦠 Bacterial" bg="#FEE2E2" color="#991B1B" />
        )}
        {result.isViral && (
          <Pill text="🦠 Viral" bg="#EDE9FE" color="#5B21B6" />
        )}
        {result.spreadRisk &&
          result.spreadRisk !== 'None' &&
          result.spreadRisk !== 'Unknown' && (
            <Pill
              text={`Spread: ${result.spreadRisk}`}
              bg={C.greyBg}
              color={C.muted}
            />
          )}
      </div>

      {/* Expandable sections */}
      <Expandable icon="🌿" title="Symptoms" defaultOpen={true}>
        <BulletList items={result.symptoms} color={C.red} />
      </Expandable>
      <Expandable icon="🌱" title="Organic Treatments">
        <BulletList items={result.organicTreatments} color={C.success} />
      </Expandable>
      <Expandable icon="🧪" title="Chemical Treatments">
        <BulletList items={result.chemicalTreatments} color={C.blue} />
      </Expandable>
      <Expandable icon="🛡️" title="Prevention Tips">
        <BulletList items={result.preventionTips} color={C.orange} />
      </Expandable>

      <div style={{ marginTop: '14px' }}>
        <Btn onClick={onReset} outline>
          ↺ Analyse Another Photo
        </Btn>
      </div>
    </div>
  );
}

function BulletList({ items, color }) {
  if (!items?.length) return null;
  return (
    <ul style={{ margin: 0, paddingLeft: '0', listStyle: 'none' }}>
      {items.map((item, i) => (
        <li
          key={i}
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '8px',
            fontSize: '13px',
            color: C.text,
            fontFamily: 'DM Sans, sans-serif',
            lineHeight: '1.5',
          }}
        >
          <span style={{ color, fontWeight: '700', flexShrink: 0 }}>›</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

// ══════════════════════════════════════════════
// FEATURE 2 — WEATHER FORECAST
// ══════════════════════════════════════════════
function WeatherTab({ onResult }) {
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState('');
  const [weather, setWeather] = useState(null);

  async function handleFetch() {
    if (!location.trim()) {
      setError('Please enter a village name or pincode.');
      return;
    }
    setLoading(true);
    setError('');
    setWeather(null);
    setConfirmed('');
    try {
      const enc = encodeURIComponent(location.trim());
      const geo = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${enc}&format=json&limit=1&countrycodes=in`,
        { headers: { 'User-Agent': 'AgriAI-Advisor-TeamDarkKnight' } }
      );
      const geoData = await geo.json();
      if (!geoData?.length)
        throw new Error(
          "Location not found. Try your district name, e.g. 'Aurangabad Maharashtra'"
        );
      const lat = parseFloat(geoData[0].lat);
      const lon = parseFloat(geoData[0].lon);
      const name = geoData[0].display_name;
      setConfirmed(name);

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode&timezone=Asia%2FKolkata&forecast_days=7`;
      const wRes = await fetch(url);
      if (!wRes.ok) throw new Error('Could not fetch weather data. Try again.');
      const wData = await wRes.json();
      setWeather(wData);
      onResult?.(wData, name);
    } catch (err) {
      setError(navigator.onLine ? err.message : 'No internet connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fade-up">
      <div style={{ ...card, marginBottom: '16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            🌤️
          </div>
          <div>
            <h2 style={h2}>7-Day Weather Forecast</h2>
            <p style={sub}>
              Enter your village or pincode for your farm's weather
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            style={{ ...inputStyle, flex: '1 1 200px' }}
            placeholder="e.g. Aurangabad Maharashtra  or  431001"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleFetch()}
          />
          <Btn onClick={handleFetch} disabled={loading} loading={loading}>
            {loading ? 'Fetching...' : 'Get Forecast'}
          </Btn>
        </div>

        {error && (
          <div
            style={{
              ...alertBox,
              background: C.redBg,
              borderColor: '#FECACA',
              color: C.red,
              marginTop: '12px',
            }}
          >
            ⚠️ {error}
          </div>
        )}
        {loading && (
          <div
            style={{
              ...alertBox,
              background: C.successBg,
              borderColor: C.greenLight,
              color: C.success,
              marginTop: '12px',
            }}
          >
            <LoadingDots label="Finding your location and fetching weather" />
          </div>
        )}
      </div>

      {confirmed && (
        <div
          className="fade-up"
          style={{
            ...alertBox,
            background: C.successBg,
            borderColor: C.greenLight,
            color: C.success,
            marginBottom: '16px',
          }}
        >
          📍 {confirmed.split(',').slice(0, 3).join(',')}
        </div>
      )}

      {weather && <WeatherCards weather={weather} />}
    </div>
  );
}

function WeatherCards({ weather }) {
  const {
    time,
    temperature_2m_max,
    temperature_2m_min,
    precipitation_probability_max,
    weathercode,
  } = weather.daily;
  const dayNames = time.map((d) =>
    new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short' })
  );
  const dates = time.map((d) =>
    new Date(d + 'T00:00:00').toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    })
  );

  // Today's big card
  const today = {
    name: dayNames[0],
    date: dates[0],
    max: temperature_2m_max[0],
    min: temperature_2m_min[0],
    rain: precipitation_probability_max[0],
    emoji: getWeatherEmoji(weathercode[0]),
    label: getWeatherLabel(weathercode[0]),
  };

  return (
    <div className="fade-up">
      {/* Today highlight */}
      <div
        style={{
          background: `linear-gradient(135deg, ${C.green} 0%, ${C.greenDark} 100%)`,
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '12px',
          color: C.white,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div>
            <p
              style={{
                margin: '0 0 4px 0',
                fontSize: '13px',
                opacity: 0.8,
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: '500',
              }}
            >
              {today.name} · {today.date}
            </p>
            <p
              style={{
                margin: '0 0 8px 0',
                fontSize: '13px',
                opacity: 0.7,
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              {today.label}
            </p>
            <div
              style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}
            >
              <span
                style={{
                  fontSize: '52px',
                  fontWeight: '700',
                  fontFamily: 'DM Sans, sans-serif',
                  lineHeight: 1,
                }}
              >
                {today.max}°
              </span>
              <span
                style={{
                  fontSize: '24px',
                  opacity: 0.7,
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                {today.min}°
              </span>
            </div>
          </div>
          <div style={{ fontSize: '64px', lineHeight: 1 }}>{today.emoji}</div>
        </div>
        <div
          style={{
            marginTop: '16px',
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '10px',
              padding: '8px 14px',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: '11px',
                opacity: 0.8,
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              Rain chance
            </p>
            <p
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '700',
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              {today.rain}%
            </p>
          </div>
          <div
            style={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '10px',
              padding: '8px 14px',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: '11px',
                opacity: 0.8,
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              Today
            </p>
            <p
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '700',
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              Today
            </p>
          </div>
        </div>
      </div>

      {/* Next 6 days as horizontal scroll cards */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '4px',
        }}
      >
        {time.slice(1).map((_, idx) => {
          const i = idx + 1;
          const rain = precipitation_probability_max[i];
          const rainColor =
            rain > 60 ? C.red : rain > 30 ? C.orange : C.success;
          return (
            <div
              key={i}
              style={{
                ...card,
                minWidth: '100px',
                flex: '0 0 100px',
                padding: '14px 10px',
                textAlign: 'center',
                marginBottom: 0,
              }}
            >
              <p
                style={{
                  margin: '0 0 2px 0',
                  fontSize: '11px',
                  fontWeight: '700',
                  color: C.muted,
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                {dayNames[i]}
              </p>
              <p
                style={{
                  margin: '0 0 8px 0',
                  fontSize: '10px',
                  color: C.muted,
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                {dates[i]}
              </p>
              <div style={{ fontSize: '26px', marginBottom: '8px' }}>
                {getWeatherEmoji(weathercode[i])}
              </div>
              <p
                style={{
                  margin: '0 0 2px 0',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: C.red,
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                {temperature_2m_max[i]}°
              </p>
              <p
                style={{
                  margin: '0 0 8px 0',
                  fontSize: '12px',
                  color: C.blue,
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                {temperature_2m_min[i]}°
              </p>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: rainColor,
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                💧 {rain}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// FEATURE 3 — IRRIGATION PLAN
// ══════════════════════════════════════════════
function IrrigationTab({ diseaseResult, weatherData, weatherLocation }) {
  const [cropName, setCropName] = useState('');
  const [acres, setAcres] = useState('');
  const [ageDays, setAgeDays] = useState('');
  const [usedDisease, setUsedDisease] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [plan, setPlan] = useState(null);

  // ── Location state (only used if weather not already fetched) ──
  const [manualLocation, setManualLocation] = useState('');
  const [fetchingWeather, setFetchingWeather] = useState(false);
  const [localWeatherData, setLocalWeatherData] = useState(null);
  const [localWeatherName, setLocalWeatherName] = useState('');
  const [weatherError, setWeatherError] = useState('');

  // Final weather to use = already fetched OR manually fetched here
  const activeWeather = weatherData || localWeatherData;
  const activeWeatherName = weatherLocation || localWeatherName;
  const hasWeather = !!activeWeather;

  // ── Fetch weather manually inside irrigation tab ──
  async function handleFetchLocationWeather() {
    if (!manualLocation.trim()) {
      setWeatherError('Please enter your village name or pincode.');
      return;
    }
    setFetchingWeather(true);
    setWeatherError('');
    setLocalWeatherData(null);

    try {
      // Step 1: Convert location text to GPS coordinates
      const encoded = encodeURIComponent(manualLocation.trim());
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1&countrycodes=in`,
        { headers: { 'User-Agent': 'AgriAI-Advisor-TeamDarkKnight' } }
      );
      const geoData = await geoRes.json();
      if (!geoData?.length)
        throw new Error(
          "Location not found. Try district name e.g. 'Aurangabad Maharashtra'"
        );

      const lat = parseFloat(geoData[0].lat);
      const lon = parseFloat(geoData[0].lon);
      const name = geoData[0].display_name;
      setLocalWeatherName(name);

      // Step 2: Fetch 7-day weather from Open-Meteo
      const wUrl =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${lat}&longitude=${lon}` +
        `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode` +
        `&timezone=Asia%2FKolkata&forecast_days=7`;

      const wRes = await fetch(wUrl);
      const wData = await wRes.json();
      setLocalWeatherData(wData);
    } catch (err) {
      setWeatherError(err.message);
    } finally {
      setFetchingWeather(false);
    }
  }

  // ── Build weather summary for LLM ──
  function getWeatherContext() {
    if (!activeWeather) return null;
    // Get today's season/month for context
    const month = new Date().getMonth() + 1;
    const season =
      month >= 6 && month <= 9
        ? 'Kharif (monsoon)'
        : month >= 10 && month <= 11
        ? 'Rabi (post-monsoon)'
        : 'Rabi/summer';
    return `Season: ${season}. ` + buildWeatherSummary(activeWeather);
  }

  // ── Fallback rule-based plan ──
  function fallback(crop, ac) {
    const L = Math.round(ac * 1800);
    return {
      cropSummary: `Standard alternate-day irrigation for ${crop} in Maharashtra.`,
      totalWaterWeek: `${(L * 4).toLocaleString()} L approx`,
      plan: Array.from({ length: 7 }, (_, i) => ({
        day: i + 1,
        action: i % 2 === 0 ? 'Irrigate' : 'Skip',
        waterLitres: i % 2 === 0 ? L : 0,
        reason:
          i % 2 === 0
            ? 'Alternate-day standard practice for Maharashtra dry climate'
            : 'Rest day — allow soil to absorb moisture',
        bestTimeOfDay: i % 2 === 0 ? 'Morning 6–8am' : '—',
      })),
      importantWarning: 'Add AI keys for personalised advice.',
    };
  }

  // ── Generate irrigation plan ──
  async function handleGenerate() {
    if (!cropName.trim() || !acres || !ageDays) {
      setError('Please fill in Crop Name, Field Size, and Crop Age.');
      return;
    }
    setLoading(true);
    setError('');
    setPlan(null);

    try {
      const weatherContext = getWeatherContext();
      const diseaseCtx =
        usedDisease && diseaseResult
          ? `Diagnosed with "${diseaseResult.diseaseName}". Adjust water accordingly.`
          : 'No disease detected.';

      const prompt = `You are an expert irrigation specialist for Maharashtra farming.
Crop: ${cropName.trim()}, Field: ${acres} acres, Age: ${ageDays} days.
Disease: ${diseaseCtx}
Weather & Season: ${
        weatherContext ||
        'No weather data — use standard Maharashtra seasonal guidelines for current month.'
      }

Create a smart 7-day irrigation plan considering:
- Rainfall probability (skip irrigation on high rain days)
- Temperature (more water on hot days above 35°C)
- Crop age and growth stage
- Disease type if applicable (reduce water for fungal diseases)
- Best time of day for irrigation in Maharashtra climate

Reply ONLY in this JSON format, no other text:
{
  "cropSummary": "one sentence about water needs at this growth stage",
  "totalWaterWeek": "total litres for the week",
  "seasonNote": "one sentence about current season impact on irrigation",
  "plan": [
    {"day":1,"action":"Irrigate","waterLitres":5000,"reason":"specific reason based on weather/crop","bestTimeOfDay":"Morning 6-8am"},
    {"day":2,"action":"Skip","waterLitres":0,"reason":"specific reason","bestTimeOfDay":"—"},
    {"day":3,"action":"Irrigate","waterLitres":5000,"reason":"specific reason","bestTimeOfDay":"Evening 5-7pm"},
    {"day":4,"action":"Skip","waterLitres":0,"reason":"specific reason","bestTimeOfDay":"—"},
    {"day":5,"action":"Irrigate","waterLitres":5000,"reason":"specific reason","bestTimeOfDay":"Morning 6-8am"},
    {"day":6,"action":"Skip","waterLitres":0,"reason":"specific reason","bestTimeOfDay":"—"},
    {"day":7,"action":"Irrigate","waterLitres":5000,"reason":"specific reason","bestTimeOfDay":"Morning 6-8am"}
  ],
  "importantWarning": "critical warning or null"
}`;

      let result;
      if (!GEMINI_KEY && !GROQ_KEY) {
        result = fallback(cropName.trim(), parseFloat(acres));
      } else {
        const reply = await callAI(prompt);
        result =
          safeParseJSON(reply) || fallback(cropName.trim(), parseFloat(acres));
      }
      setPlan(result);
    } catch (err) {
      if (err.message === 'RATE_LIMIT')
        setError('Too many requests. Wait 1 minute.');
      else setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fade-up">
      <div style={{ ...card, marginBottom: '16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            💧
          </div>
          <div>
            <h2 style={h2}>Smart Irrigation Plan</h2>
            <p style={sub}>
              AI generates plan using your crop details + live weather
            </p>
          </div>
        </div>

        {/* ── WEATHER SECTION ── */}
        {weatherData ? (
          // Weather already fetched from Weather tab — use automatically
          <div
            style={{
              background: C.successBg,
              border: `1px solid ${C.greenLight}`,
              borderRadius: '10px',
              padding: '12px 14px',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span style={{ fontSize: '20px' }}>🌤️</span>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: '13px',
                  fontWeight: '700',
                  color: C.success,
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                ✅ Using live weather for {weatherLocation?.split(',')[0]}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: '12px',
                  color: C.success,
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                7-day forecast will be used to optimise your irrigation schedule
              </p>
            </div>
          </div>
        ) : localWeatherData ? (
          // Weather fetched manually inside this tab
          <div
            style={{
              background: C.successBg,
              border: `1px solid ${C.greenLight}`,
              borderRadius: '10px',
              padding: '12px 14px',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>🌤️</span>
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: '13px',
                    fontWeight: '700',
                    color: C.success,
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                >
                  ✅ Weather loaded for {localWeatherName.split(',')[0]}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: '12px',
                    color: C.success,
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                >
                  Rain forecast will automatically skip irrigation on rainy days
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setLocalWeatherData(null);
                setLocalWeatherName('');
                setManualLocation('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: C.success,
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
              }}
            >
              ✕
            </button>
          </div>
        ) : (
          // No weather yet — show location input
          <div
            style={{
              background: C.orangeBg,
              border: `1px solid #FDE68A`,
              borderRadius: '10px',
              padding: '14px',
              marginBottom: '14px',
            }}
          >
            <p
              style={{
                margin: '0 0 10px 0',
                fontSize: '13px',
                fontWeight: '600',
                color: C.orange,
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              🌦️ Add your location for a weather-smart irrigation plan
            </p>
            <p
              style={{
                margin: '0 0 10px 0',
                fontSize: '12px',
                color: C.orange,
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              Without weather: basic plan · With weather: AI skips irrigation on
              rainy days automatically
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input
                style={{
                  ...inputStyle,
                  flex: '1 1 180px',
                  marginBottom: 0,
                  borderColor: '#FDE68A',
                }}
                placeholder="Village name or pincode e.g. 431001"
                value={manualLocation}
                onChange={(e) => setManualLocation(e.target.value)}
                onKeyDown={(e) =>
                  e.key === 'Enter' &&
                  !fetchingWeather &&
                  handleFetchLocationWeather()
                }
              />
              <Btn
                onClick={handleFetchLocationWeather}
                disabled={fetchingWeather}
                loading={fetchingWeather}
              >
                {fetchingWeather ? 'Fetching...' : 'Get Weather'}
              </Btn>
            </div>
            {weatherError && (
              <p
                style={{
                  margin: '8px 0 0 0',
                  fontSize: '12px',
                  color: C.red,
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                ⚠️ {weatherError}
              </p>
            )}
            <p
              style={{
                margin: '8px 0 0 0',
                fontSize: '11px',
                color: C.orange,
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              Or go to Weather tab first → then come back here (weather loads
              automatically)
            </p>
          </div>
        )}

        {/* ── DISEASE IMPORT ── */}
        {diseaseResult && (
          <div
            onClick={() => setUsedDisease((p) => !p)}
            style={{
              borderRadius: '10px',
              padding: '10px 14px',
              marginBottom: '14px',
              background: usedDisease ? C.successBg : C.greyBg,
              border: `1px solid ${usedDisease ? C.greenLight : C.border}`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontSize: '13px',
                fontFamily: 'DM Sans, sans-serif',
                color: usedDisease ? C.success : C.muted,
              }}
            >
              🔬 {usedDisease ? 'Using' : 'Use'} disease data:{' '}
              <strong>{diseaseResult.diseaseName}</strong>
            </span>
            <span style={{ fontSize: '18px' }}>{usedDisease ? '✅' : '⊕'}</span>
          </div>
        )}

        {/* ── CROP FORM ── */}
        <div style={{ marginBottom: '12px' }}>
          <label style={lbl}>Crop Name *</label>
          <input
            style={inputStyle}
            placeholder="e.g. Tomato, Cotton, Onion, Wheat, Soybean"
            value={cropName}
            onChange={(e) => setCropName(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 130px' }}>
            <label style={lbl}>Field Size (acres) *</label>
            <input
              style={inputStyle}
              type="number"
              min="0.1"
              step="0.1"
              placeholder="e.g. 2.5"
              value={acres}
              onChange={(e) => setAcres(e.target.value)}
            />
          </div>
          <div style={{ flex: '1 1 130px' }}>
            <label style={lbl}>Crop Age (days) *</label>
            <input
              style={inputStyle}
              type="number"
              min="1"
              max="365"
              placeholder="e.g. 45"
              value={ageDays}
              onChange={(e) => setAgeDays(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div
            style={{
              ...alertBox,
              background: C.redBg,
              borderColor: '#FECACA',
              color: C.red,
              marginBottom: '12px',
            }}
          >
            ⚠️ {error}
          </div>
        )}
        {loading && (
          <div
            style={{
              ...alertBox,
              background: C.successBg,
              borderColor: C.greenLight,
              color: C.success,
              marginBottom: '12px',
            }}
          >
            <LoadingDots
              label={
                hasWeather
                  ? 'Generating weather-smart irrigation plan'
                  : 'Generating irrigation plan'
              }
            />
          </div>
        )}

        {/* Show what data will be used */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            marginBottom: '14px',
          }}
        >
          <Pill
            text={hasWeather ? '✅ Weather included' : '⚠️ No weather'}
            bg={hasWeather ? C.successBg : C.orangeBg}
            color={hasWeather ? C.success : C.orange}
          />
          <Pill
            text={usedDisease ? '✅ Disease included' : 'No disease data'}
            bg={usedDisease ? C.successBg : C.greyBg}
            color={usedDisease ? C.success : C.muted}
          />
          <Pill text="📅 7-day plan" bg={C.blueBg} color={C.blue} />
        </div>

        <Btn onClick={handleGenerate} disabled={loading} loading={loading} full>
          {loading ? 'Generating plan...' : '💧 Generate Smart Irrigation Plan'}
        </Btn>
      </div>

      {plan && <IrrigationPlan plan={plan} onRedo={handleGenerate} />}
    </div>
  );
}

function IrrigationPlan({ plan, onRedo }) {
  const irrigateDays =
    plan.plan?.filter((d) => d.action === 'Irrigate').length || 0;
  return (
    <div className="fade-up">
      {/* Summary stat cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '10px',
          marginBottom: '12px',
        }}
      >
        {[
          {
            label: 'Total water',
            value: plan.totalWaterWeek || '—',
            icon: '💧',
            bg: '#EFF6FF',
            color: C.blue,
          },
          {
            label: 'Irrigate days',
            value: `${irrigateDays} of 7`,
            icon: '🚿',
            bg: C.successBg,
            color: C.success,
          },
          {
            label: 'Skip days',
            value: `${7 - irrigateDays} of 7`,
            icon: '⏭️',
            bg: C.greyBg,
            color: C.muted,
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              ...card,
              padding: '14px',
              marginBottom: 0,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '6px' }}>
              {s.icon}
            </div>
            <p
              style={{
                margin: '0 0 2px 0',
                fontSize: '18px',
                fontWeight: '700',
                color: s.color,
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              {s.value}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: '11px',
                color: C.muted,
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {plan.cropSummary && (
        <div
          style={{
            ...alertBox,
            background: C.successBg,
            borderColor: C.greenLight,
            color: C.success,
            marginBottom: '12px',
          }}
        >
          🌱 {plan.cropSummary}
        </div>
      )}
      {plan.importantWarning && (
        <div
          style={{
            ...alertBox,
            background: C.orangeBg,
            borderColor: '#FDE68A',
            color: C.orange,
            marginBottom: '12px',
          }}
        >
          ⚠️ {plan.importantWarning}
        </div>
      )}

      {/* Day-by-day visual cards */}
      <div style={{ ...card }}>
        <h3
          style={{
            margin: '0 0 14px 0',
            fontSize: '15px',
            fontWeight: '700',
            color: C.text,
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          📅 Day-by-Day Plan
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {plan.plan?.map((row, i) => {
            const isIrrigate = row.action === 'Irrigate';
            return (
              <div
                key={i}
                style={{
                  background: isIrrigate ? C.successBg : C.greyBg,
                  border: `1px solid ${isIrrigate ? C.greenLight : C.border}`,
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                {/* Day number circle */}
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: isIrrigate ? C.green : C.border,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: isIrrigate ? C.white : C.muted,
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                >
                  {row.day}
                </div>
                {/* Content */}
                <div style={{ flex: 1, minWidth: '140px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flexWrap: 'wrap',
                      marginBottom: '4px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: '700',
                        color: isIrrigate ? C.success : C.muted,
                        fontFamily: 'DM Sans, sans-serif',
                      }}
                    >
                      {isIrrigate ? '💧 Irrigate' : '⏭️ Skip'}
                    </span>
                    {isIrrigate && row.waterLitres > 0 && (
                      <Pill
                        text={`${row.waterLitres.toLocaleString()} L`}
                        bg={C.blueBg}
                        color={C.blue}
                      />
                    )}
                    {isIrrigate &&
                      row.bestTimeOfDay &&
                      row.bestTimeOfDay !== '—' && (
                        <Pill
                          text={`⏰ ${row.bestTimeOfDay}`}
                          bg={C.greyBg}
                          color={C.muted}
                        />
                      )}
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '12px',
                      color: C.muted,
                      fontFamily: 'DM Sans, sans-serif',
                      lineHeight: '1.4',
                    }}
                  >
                    {row.reason}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: '14px' }}>
          <Btn onClick={onRedo} outline>
            ↺ Regenerate Plan
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ── PRINT REPORT ──
function PrintReport({
  diseaseResult,
  confidence,
  weatherData,
  weatherLocation,
  plan,
  onClose,
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: C.cardBg,
        overflowY: 'auto',
        zIndex: 9999,
        fontFamily: 'DM Sans, sans-serif',
      }}
    >
      <div
        id="print-hide"
        style={{
          background: C.green,
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <span style={{ color: C.white, fontWeight: '600', fontSize: '14px' }}>
          📄 Report Preview
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Btn onClick={() => window.print()}>🖨️ Print / Save PDF</Btn>
          <Btn onClick={onClose} outline>
            ✕ Close
          </Btn>
        </div>
      </div>
      <div
        style={{ maxWidth: '700px', margin: '0 auto', padding: '32px 24px' }}
      >
        <div
          style={{
            textAlign: 'center',
            borderBottom: `2px solid ${C.green}`,
            paddingBottom: '20px',
            marginBottom: '28px',
          }}
        >
          <h1
            style={{
              margin: '0 0 4px 0',
              fontSize: '22px',
              fontWeight: '700',
              color: C.green,
            }}
          >
            🌾 AgriAI Advisor
          </h1>
          <p style={{ margin: 0, fontSize: '12px', color: C.muted }}>
            Team Dark Knight · {new Date().toLocaleString('en-IN')}
          </p>
        </div>
        {diseaseResult && (
          <div style={{ marginBottom: '24px' }}>
            <h2
              style={{
                fontSize: '15px',
                fontWeight: '700',
                color: C.green,
                borderBottom: `1px solid ${C.border}`,
                paddingBottom: '6px',
              }}
            >
              🔬 Disease Detection
            </h2>
            <p style={{ fontSize: '13px' }}>
              <strong>Crop:</strong> {diseaseResult.cropName} ·{' '}
              <strong>Disease:</strong> {diseaseResult.diseaseName} ·{' '}
              <strong>Confidence:</strong> {confidence}%
            </p>
            <p style={{ fontSize: '13px' }}>
              <strong>Urgency:</strong> {diseaseResult.urgencyLevel} —{' '}
              {diseaseResult.urgencyReason}
            </p>
            {diseaseResult.symptoms?.length > 0 && (
              <>
                <h4 style={{ fontSize: '13px', margin: '8px 0 4px' }}>
                  Symptoms
                </h4>
                <ul style={{ fontSize: '13px', margin: 0 }}>
                  {diseaseResult.symptoms.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </>
            )}
            {diseaseResult.organicTreatments?.length > 0 && (
              <>
                <h4 style={{ fontSize: '13px', margin: '8px 0 4px' }}>
                  Organic Treatments
                </h4>
                <ul style={{ fontSize: '13px', margin: 0 }}>
                  {diseaseResult.organicTreatments.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </>
            )}
            {diseaseResult.chemicalTreatments?.length > 0 && (
              <>
                <h4 style={{ fontSize: '13px', margin: '8px 0 4px' }}>
                  Chemical Treatments
                </h4>
                <ul style={{ fontSize: '13px', margin: 0 }}>
                  {diseaseResult.chemicalTreatments.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
        {weatherData && (
          <div style={{ marginBottom: '24px' }}>
            <h2
              style={{
                fontSize: '15px',
                fontWeight: '700',
                color: C.green,
                borderBottom: `1px solid ${C.border}`,
                paddingBottom: '6px',
              }}
            >
              🌤️ Weather Forecast · {weatherLocation?.split(',')[0]}
            </h2>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13px',
              }}
            >
              <thead>
                <tr>
                  {['Date', 'Max°C', 'Min°C', 'Rain%', 'Condition'].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: 'left',
                        padding: '5px',
                        borderBottom: `1px solid ${C.border}`,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weatherData.daily.time.map((d, i) => (
                  <tr key={d} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '5px' }}>
                      {new Date(d + 'T00:00:00').toLocaleDateString('en-IN', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>
                    <td style={{ padding: '5px' }}>
                      {weatherData.daily.temperature_2m_max[i]}°
                    </td>
                    <td style={{ padding: '5px' }}>
                      {weatherData.daily.temperature_2m_min[i]}°
                    </td>
                    <td style={{ padding: '5px' }}>
                      {weatherData.daily.precipitation_probability_max[i]}%
                    </td>
                    <td style={{ padding: '5px' }}>
                      {getWeatherEmoji(weatherData.daily.weathercode[i])}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {plan?.plan?.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h2
              style={{
                fontSize: '15px',
                fontWeight: '700',
                color: C.green,
                borderBottom: `1px solid ${C.border}`,
                paddingBottom: '6px',
              }}
            >
              💧 Irrigation Plan
            </h2>
            {plan.cropSummary && (
              <p style={{ fontSize: '13px' }}>{plan.cropSummary}</p>
            )}
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13px',
              }}
            >
              <thead>
                <tr>
                  {['Day', 'Action', 'Water (L)', 'Time', 'Reason'].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: 'left',
                        padding: '5px',
                        borderBottom: `1px solid ${C.border}`,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {plan.plan.map((r, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '5px' }}>Day {r.day}</td>
                    <td
                      style={{
                        padding: '5px',
                        fontWeight: '600',
                        color: r.action === 'Irrigate' ? C.success : C.muted,
                      }}
                    >
                      {r.action}
                    </td>
                    <td style={{ padding: '5px' }}>
                      {r.waterLitres > 0 ? r.waterLitres.toLocaleString() : '—'}
                    </td>
                    <td style={{ padding: '5px' }}>
                      {r.bestTimeOfDay !== '—' ? r.bestTimeOfDay : '—'}
                    </td>
                    <td style={{ padding: '5px' }}>{r.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div
          style={{
            borderTop: `1px solid ${C.border}`,
            paddingTop: '16px',
            textAlign: 'center',
            fontSize: '12px',
            color: C.muted,
          }}
        >
          <p style={{ margin: 0 }}>
            AgriAI Advisor · Team Dark Knight · Built with ❤️ for Maharashtra
            Farmers · v1.0
          </p>
        </div>
      </div>
      <style>{`@media print { #print-hide { display:none!important; } }`}</style>
    </div>
  );
}

// ── SHARED STYLE TOKENS (used inline throughout) ──
const card = {
  background: C.cardBg,
  border: `1px solid ${C.border}`,
  borderRadius: '14px',
  padding: '20px',
  marginBottom: '16px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
};
const h2 = {
  margin: 0,
  fontSize: '17px',
  fontWeight: '700',
  color: C.text,
  fontFamily: 'DM Sans, sans-serif',
};
const sub = {
  margin: '2px 0 0 0',
  fontSize: '12px',
  color: C.muted,
  fontFamily: 'DM Sans, sans-serif',
};
const lbl = {
  display: 'block',
  fontSize: '13px',
  fontWeight: '600',
  color: C.text,
  fontFamily: 'DM Sans, sans-serif',
  marginBottom: '6px',
};
const inputStyle = {
  border: `1px solid ${C.border}`,
  borderRadius: '10px',
  padding: '11px 14px',
  fontSize: '14px',
  width: '100%',
  boxSizing: 'border-box',
  fontFamily: 'DM Sans, sans-serif',
  color: C.text,
  outline: 'none',
  background: C.cardBg,
  marginBottom: '12px',
};
const alertBox = {
  borderRadius: '10px',
  padding: '11px 14px',
  border: '1px solid',
  fontSize: '13px',
  fontFamily: 'DM Sans, sans-serif',
};

// ── ROOT APP ──
export default function App() {
  const [tab, setTab] = useState('disease');
  const [diseaseResult, setDR] = useState(null);
  const [confidence, setConf] = useState(0);
  const [weatherData, setWD] = useState(null);
  const [weatherLocation, setWL] = useState('');
  const [irrigationPlan, setIP] = useState(null);
  const [showReport, setShowReport] = useState(false);

  function handleReset() {
    if (!window.confirm('Reset all data and start fresh?')) return;
    setTab('disease');
    setDR(null);
    setConf(0);
    setWD(null);
    setWL('');
    setIP(null);
    setShowReport(false);
  }

  const hasResult = !!(diseaseResult || weatherData || irrigationPlan);

  return (
    <div style={{ background: C.pageBg, minHeight: '100vh' }}>
      <GlobalStyles />

      {showReport && (
        <PrintReport
          diseaseResult={diseaseResult}
          confidence={confidence}
          weatherData={weatherData}
          weatherLocation={weatherLocation}
          plan={irrigationPlan}
          onClose={() => setShowReport(false)}
        />
      )}

      <Header onReset={handleReset} />
      <TabBar active={tab} onChange={setTab} />

      <main
        style={{ maxWidth: '680px', margin: '0 auto', padding: '20px 16px' }}
      >
        {tab === 'disease' && (
          <DiseaseTab
            onResult={(r, c) => {
              setDR(r);
              setConf(c);
            }}
          />
        )}
        {tab === 'weather' && (
          <WeatherTab
            onResult={(d, l) => {
              setWD(d);
              setWL(l);
            }}
          />
        )}
        {tab === 'irrigation' && (
          <IrrigationTab
            diseaseResult={diseaseResult}
            weatherData={weatherData}
            weatherLocation={weatherLocation}
          />
        )}

        {hasResult && (
          <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
            <Btn onClick={() => setShowReport(true)}>
              📄 Generate Full Report
            </Btn>
          </div>
        )}
      </main>

      <footer
        style={{
          background: C.cardBg,
          borderTop: `1px solid ${C.border}`,
          padding: '18px',
          textAlign: 'center',
          marginTop: '24px',
        }}
      >
        <p
          style={{
            margin: '0 0 4px',
            fontSize: '13px',
            fontWeight: '600',
            color: C.text,
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          🛡️ Team Dark Knight · AgriAI Advisor
        </p>
        <p
          style={{
            margin: 0,
            fontSize: '11px',
            color: C.muted,
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          v1.0 · Built with ❤️ for Maharashtra Farmers · Aurangabad Region
        </p>
      </footer>
    </div>
  );
}
