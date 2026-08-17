/**
 * PaymentGateway.js  (STUB — no live payment flow is implemented here)
 * ---------------------------------------------------------------------------
 * Future flow this is designed to support:
 *
 *   Birth Details -> Generate Preview -> Payment -> Unlock Full Kundali PDF
 *
 * Today, `isUnlocked()` always returns true, so the full report is generated
 * and downloadable without payment (appropriate for this demo build). To
 * wire up real payments later:
 *
 *   1. Pick a provider (Stripe is the common default; Razorpay/PayU are
 *      common alternatives for an India-focused audience) and add its SDK.
 *   2. Add a "preview" mode to ResultsPage.jsx: render the Overview + Lagna/
 *      Rashi/Nakshatra + a blurred/locked interpretation + chart, with a
 *      "Pay to unlock full report" CTA calling createCheckoutSession() below.
 *   3. Implement createCheckoutSession() to call your provider's API from a
 *      server route (never from the client) and return a redirect URL.
 *   4. Implement verifyPayment() as a webhook handler (e.g.
 *      app/api/payments/webhook/route.js) that marks the order paid in your
 *      database, keyed by a session/order id.
 *   5. Change isUnlocked() to check that record instead of always returning
 *      true, and gate InterpretationEngine + PDFGenerator calls behind it.
 *
 * Do NOT implement a fake "Pay Now" button that just flips a flag client-side
 * — that both misleads users and is trivial to bypass.
 */

export async function createCheckoutSession(/* { chartId, priceId, successUrl, cancelUrl } */) {
  throw new Error('Payments are not configured in this build. Wire up a provider (Stripe/Razorpay) here before calling this function.');
}

export async function verifyPayment(/* { sessionId } */) {
  throw new Error('Payments are not configured in this build.');
}

export function isUnlocked(/* chartId */) {
  return true; // demo build: full report is always unlocked
}
