all · JS
Copy

// ── Start Your Cause — Paywall & Subscription System ──
// Stripe-ready subscription gate. Replace STRIPE_PUBLISHABLE_KEY and
// price IDs with your real values from the Stripe dashboard.
 
// ── CONFIGURATION ── replace these when ready to go live
const PAYWALL_CONFIG = {
  stripePublishableKey: 'pk_live_51TLnV2RyNZ1TUldS1oCbXHlyJ7ySi72JfjrjHrjdS9eCLI5oyO3lZQNLVXT87NktLLixTNEygLJOdm9PExAyVwvI00sa2xJaBp', // Replace with your Stripe key
  plans: {
    monthly: {
      id: 'monthly',
      name: 'Monthly',
      price: 12,
      period: 'month',
      stripePriceId: 'price_1TMAwiRyNZ1TUldSZ7tIW7wi', // Replace with your Stripe price ID
      features: [
        'All 8 formation documents',
        'All 4 yearly filing documents',
        'Form 990 / 990-EZ / 990-N prep guide',
        'Annual state report templates (all 56 jurisdictions)',
        'Annual board meeting minutes',
        'Donor acknowledgment letters (5 templates)',
        'State guide for all 50 states + territories',
        'Unlimited document regeneration',
        'Email support',
      ],
    },
    annual: {
      id: 'annual',
      name: 'Annual',
      price: 79,
      period: 'year',
      stripePriceId: 'price_1TMAyDRyNZ1TUldSuM557LTK', // Replace with your Stripe price ID
      badge: 'Best value — save 45%',
      features: [
        'Everything in Monthly',
        'Priority email support',
        'New documents added automatically',
        'Annual compliance reminder emails',
        'Save $65 vs monthly',
      ],
    },
  },
  // Netlify Function URL (set up after deployment)
  checkoutUrl: '/.netlify/functions/create-checkout',
  verifyUrl: '/.netlify/functions/verify-session',
};
 
// ── SESSION STORAGE KEY ──
const SESSION_KEY = 'syc_access';
const SESSION_EXPIRY_KEY = 'syc_access_expiry';
 
// ── CHECK IF USER HAS ACCESS ──
function hasAccess() {
  // Check URL for success param first (after Stripe redirect)
  const params = new URLSearchParams(window.location.search);
  if (params.get('subscribed') === 'true') {
    grantAccess(params.get('plan') || 'monthly');
    // Clean URL without reloading
    window.history.replaceState({}, document.title, window.location.pathname);
    return true;
  }
  // Check session storage for valid paid access
  const token = sessionStorage.getItem(SESSION_KEY);
  const expiry = sessionStorage.getItem(SESSION_EXPIRY_KEY);
  if (token && token.startsWith('paid_') && expiry && Date.now() < parseInt(expiry)) return true;
  return false;
}
 
// ── GRANT ACCESS (called after successful payment) ──
function grantAccess(plan) {
  const duration = plan === 'annual'
    ? 365 * 24 * 60 * 60 * 1000
    : 31 * 24 * 60 * 60 * 1000;
  sessionStorage.setItem(SESSION_KEY, 'paid_' + Date.now());
  sessionStorage.setItem(SESSION_EXPIRY_KEY, (Date.now() + duration).toString());
  sessionStorage.setItem('syc_plan', plan);
}
 
// ── REVOKE ACCESS (logout) ──
function revokeAccess() {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_EXPIRY_KEY);
  sessionStorage.removeItem('syc_plan');
}
 
// ── INITIATE STRIPE CHECKOUT ──
// When Stripe keys are configured, this redirects to Stripe's hosted checkout.
// Until then it shows the demo access flow.
async function startCheckout(planId) {
  const plan = PAYWALL_CONFIG.plans[planId];
  if (!plan) return;
 
  // PRODUCTION MODE — redirect to Stripe Checkout
  try {
    const btn = document.getElementById('checkout-btn-' + planId);
    if (btn) { btn.textContent = 'Redirecting to payment...'; btn.disabled = true; }
 
    const res = await fetch(PAYWALL_CONFIG.checkoutUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priceId: plan.stripePriceId,
        planId: planId,
        successUrl: window.location.origin + '/?subscribed=true&plan=' + planId,
        cancelUrl: window.location.origin + '/?canceled=true',
      }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
  } catch (err) {
    console.error('Checkout error:', err);
    alert('Payment system unavailable. Please try again later.');
  }
}
 
// ── RENDER PRICING MODAL ──
function showPricingModal(context) {
  let existing = document.getElementById('pricing-modal');
  if (existing) { existing.style.display = 'flex'; return; }
 
  const monthly = PAYWALL_CONFIG.plans.monthly;
  const annual = PAYWALL_CONFIG.plans.annual;
 
  const modal = document.createElement('div');
  modal.id = 'pricing-modal';
  modal.style.cssText = `
    position:fixed;inset:0;background:rgba(44,36,24,0.7);z-index:9999;
    display:flex;align-items:center;justify-content:center;padding:1rem;
    font-family:'DM Sans',sans-serif;
  `;
  modal.innerHTML = `
    <div style="background:#fff9f4;border-radius:16px;max-width:680px;width:100%;padding:2.5rem 2rem;position:relative;max-height:90vh;overflow-y:auto">
      <button onclick="hidePricingModal()" style="position:absolute;top:1rem;right:1rem;background:none;border:none;font-size:22px;cursor:pointer;color:#9e8e7e;line-height:1">✕</button>
      <div style="text-align:center;margin-bottom:2rem">
        <div style="font-size:12px;font-weight:500;color:#2d8f6f;letter-spacing:.08em;text-transform:uppercase;margin-bottom:.5rem">Start Your Cause</div>
        <h2 style="font-family:'Lora',serif;font-size:1.75rem;color:#2c2418;margin-bottom:.5rem">Unlock all documents</h2>
        <p style="color:#6b5c4c;font-size:15px;max-width:440px;margin:0 auto">Get access to all formation documents, yearly filing templates, and state-specific guides — for every nonprofit you run.</p>
      </div>
 
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem">
 
        <!-- Monthly -->
        <div style="background:#fff;border:1.5px solid #e2d5c6;border-radius:12px;padding:1.5rem">
          <div style="font-size:13px;font-weight:500;color:#9e8e7e;margin-bottom:.25rem;text-transform:uppercase;letter-spacing:.06em">Monthly</div>
          <div style="font-size:2.2rem;font-family:'Lora',serif;font-weight:600;color:#2c2418;line-height:1">$${monthly.price}</div>
          <div style="font-size:13px;color:#9e8e7e;margin-bottom:1.25rem">per month</div>
          <ul style="list-style:none;padding:0;margin:0 0 1.5rem;font-size:13px;color:#6b5c4c;line-height:1">
            ${monthly.features.map(f=>`<li style="padding:5px 0;border-bottom:1px solid #f0e9de;display:flex;align-items:flex-start;gap:8px"><span style="color:#2d8f6f;font-size:14px;flex-shrink:0">✓</span>${f}</li>`).join('')}
          </ul>
          <button id="checkout-btn-monthly" onclick="startCheckout('monthly')"
            style="width:100%;padding:11px;border-radius:8px;background:#fff;border:1.5px solid #c4e8d8;color:#1d6b52;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;cursor:pointer;transition:all .15s"
            onmouseover="this.style.background='#e8f5ef'" onmouseout="this.style.background='#fff'">
            Start monthly plan
          </button>
        </div>
 
        <!-- Annual -->
        <div style="background:#fff;border:2px solid #2d8f6f;border-radius:12px;padding:1.5rem;position:relative">
          <div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:#2d8f6f;color:#fff;font-size:11px;font-weight:500;padding:4px 14px;border-radius:20px;white-space:nowrap">${annual.badge}</div>
          <div style="font-size:13px;font-weight:500;color:#2d8f6f;margin-bottom:.25rem;text-transform:uppercase;letter-spacing:.06em">Annual</div>
          <div style="font-size:2.2rem;font-family:'Lora',serif;font-weight:600;color:#2c2418;line-height:1">$${annual.price}</div>
          <div style="font-size:13px;color:#9e8e7e;margin-bottom:1.25rem">per year <span style="color:#2d8f6f;font-size:12px">(= $${(annual.price/12).toFixed(2)}/mo)</span></div>
          <ul style="list-style:none;padding:0;margin:0 0 1.5rem;font-size:13px;color:#6b5c4c;line-height:1">
            ${annual.features.map(f=>`<li style="padding:5px 0;border-bottom:1px solid #f0e9de;display:flex;align-items:flex-start;gap:8px"><span style="color:#2d8f6f;font-size:14px;flex-shrink:0">✓</span>${f}</li>`).join('')}
          </ul>
          <button id="checkout-btn-annual" onclick="startCheckout('annual')"
            style="width:100%;padding:11px;border-radius:8px;background:#2d8f6f;border:none;color:#fff;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;cursor:pointer;transition:background .15s"
            onmouseover="this.style.background='#1d6b52'" onmouseout="this.style.background='#2d8f6f'">
            Start annual plan →
          </button>
        </div>
      </div>
 
      <p style="text-align:center;font-size:12px;color:#9e8e7e;line-height:1.6">
        🔒 Secure payment via Stripe &nbsp;·&nbsp; Cancel anytime &nbsp;·&nbsp; 7-day money-back guarantee<br>
        Start Your Cause is for informational use only and does not provide legal or tax advice.
      </p>
    </div>
  `;
 
  // Close on backdrop click
  modal.addEventListener('click', e => { if (e.target === modal) hidePricingModal(); });
  document.body.appendChild(modal);
}
 
function hidePricingModal() {
  const modal = document.getElementById('pricing-modal');
  if (modal) modal.style.display = 'none';
}
 
function showAccessGranted(plan) {
  const banner = document.createElement('div');
  banner.style.cssText = 'position:fixed;top:72px;left:50%;transform:translateX(-50%);background:#2d8f6f;color:#fff;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:500;z-index:9998;font-family:DM Sans,sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.15)';
  banner.textContent = `✓ Access granted! Welcome to Start Your Cause ${plan.name}.`;
  document.body.appendChild(banner);
  setTimeout(() => banner.remove(), 4000);
}
 
// ── PAYWALL GATE — wrap document generation ──
// Call this instead of openDoc() for paywalled content
function paywallGate(callback, context) {
  // Clear any old non-paid demo sessions
  const token = sessionStorage.getItem(SESSION_KEY);
  if (token && !token.startsWith('paid_')) {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_EXPIRY_KEY);
  }
  if (hasAccess()) {
    callback();
  } else {
    showPricingModal(context);
  }
}
 
// ── RENDER INLINE PRICING SECTION (for pricing page) ──
function renderPricingSection(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const monthly = PAYWALL_CONFIG.plans.monthly;
  const annual = PAYWALL_CONFIG.plans.annual;
 
  container.innerHTML = `
    <div style="max-width:700px;margin:0 auto">
      <div style="text-align:center;margin-bottom:2.5rem">
        <div class="stag">pricing</div>
        <h2 style="font-size:clamp(1.5rem,3vw,2.1rem);margin-bottom:.75rem">Simple, transparent pricing</h2>
        <p style="color:var(--tmid);font-size:15px;max-width:480px;margin:0 auto">One subscription covers all documents for all your nonprofits — formation, yearly filings, and everything in between.</p>
      </div>
 
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;margin-bottom:2rem">
        <div style="background:var(--warm);border:1px solid var(--sand2);border-radius:var(--r);padding:1.75rem">
          <div class="stag" style="color:var(--tlight)">Monthly</div>
          <div style="font-size:2.5rem;font-family:'Lora',serif;font-weight:600;color:var(--text);line-height:1;margin:.25rem 0">$${monthly.price}</div>
          <div style="font-size:13px;color:var(--tlight);margin-bottom:1.25rem">per month, cancel anytime</div>
          <ul style="list-style:none;padding:0;margin:0 0 1.5rem">
            ${monthly.features.map(f=>`<li style="padding:6px 0;border-bottom:1px solid var(--sand);font-size:13px;color:var(--tmid);display:flex;gap:8px;align-items:flex-start"><span style="color:var(--green);flex-shrink:0">✓</span>${f}</li>`).join('')}
          </ul>
          <button onclick="startCheckout('monthly')" class="btn btn-s" style="width:100%;text-align:center">Start monthly</button>
        </div>
 
        <div style="background:var(--warm);border:2px solid var(--green);border-radius:var(--r);padding:1.75rem;position:relative">
          <div style="position:absolute;top:-13px;left:50%;transform:translateX(-50%);background:var(--green);color:#fff;font-size:11px;font-weight:500;padding:4px 14px;border-radius:20px;white-space:nowrap">${annual.badge}</div>
          <div class="stag">Annual</div>
          <div style="font-size:2.5rem;font-family:'Lora',serif;font-weight:600;color:var(--text);line-height:1;margin:.25rem 0">$${annual.price}</div>
          <div style="font-size:13px;color:var(--tlight);margin-bottom:1.25rem">per year — just $${(annual.price/12).toFixed(2)}/month</div>
          <ul style="list-style:none;padding:0;margin:0 0 1.5rem">
            ${annual.features.map(f=>`<li style="padding:6px 0;border-bottom:1px solid var(--sand);font-size:13px;color:var(--tmid);display:flex;gap:8px;align-items:flex-start"><span style="color:var(--green);flex-shrink:0">✓</span>${f}</li>`).join('')}
          </ul>
          <button onclick="startCheckout('annual')" class="btn btn-p" style="width:100%;text-align:center">Start annual plan →</button>
        </div>
      </div>
 
      <p style="text-align:center;font-size:12px;color:var(--tlight)">
        🔒 Secure payment via Stripe &nbsp;·&nbsp; Cancel anytime &nbsp;·&nbsp; 7-day money-back guarantee
      </p>
    </div>
  `;
}
 
// ── NETLIFY FUNCTION TEMPLATE (instructions) ──
// Create this file at: netlify/functions/create-checkout.js in your project
const NETLIFY_FUNCTION_TEMPLATE = `
// netlify/functions/create-checkout.js
// Install: npm install stripe
// Set env var STRIPE_SECRET_KEY in Netlify dashboard
 
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
 
exports.handler = async (event) => {
  const { priceId, successUrl, cancelUrl } = JSON.parse(event.body);
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
  return {
    statusCode: 200,
    body: JSON.stringify({ url: session.url }),
  };
};
`;
