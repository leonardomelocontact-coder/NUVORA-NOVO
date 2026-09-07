const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function products() {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'products.json'), 'utf8'));
}
function money(v) { return Number(v).toFixed(2); }
function cleanCPF(v) { return String(v || '').replace(/\D/g, ''); }
function cleanName(v) { return String(v || '').trim().replace(/\s+/g, ' '); }
function emailOk(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '')); }

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });
  try {
    const token = process.env.MP_ACCESS_TOKEN;
    if (!token) return res.status(500).json({ error: 'MP_ACCESS_TOKEN não configurado no Vercel.' });
    const body = req.body || {};
    const item = products().find(p => String(p.id) === String(body.productId));
    const qty = Math.max(1, Math.min(20, Number(body.quantity || 1)));
    if (!item) return res.status(400).json({ error: 'Produto inválido.' });
    const customer = body.customer || {};
    const name = cleanName(customer.name);
    const email = String(customer.email || '').trim();
    const cpf = cleanCPF(customer.identificationNumber || customer.cpf);
    if (!name || !emailOk(email) || cpf.length !== 11) return res.status(400).json({ error: 'Nome, e-mail e CPF válidos são obrigatórios.' });
    const method = body.paymentMethod === 'pix' ? 'pix' : 'card';
    const amount = money(item.price * qty);
    const payment = method === 'pix'
      ? { amount, payment_method: { id: 'pix', type: 'bank_transfer' } }
      : { amount, payment_method: { id: String(body.payment_method_id || 'master'), type: String(body.payment_method_id || '').includes('debit') ? 'debit_card' : 'credit_card', token: body.token, installments: Number(body.installments || 1) } };
    if (method === 'card' && !body.token) return res.status(400).json({ error: 'Token do cartão não recebido.' });
    if (method === 'card' && body.issuer_id) payment.payment_method.issuer_id = Number(body.issuer_id);
    const externalReference = `NUVORA-${Date.now()}-${crypto.randomUUID()}`;
    const response = await fetch('https://api.mercadopago.com/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'X-Idempotency-Key': crypto.randomUUID() },
      body: JSON.stringify({
        type: 'online', processing_mode: 'automatic', total_amount: amount,
        external_reference: externalReference,
        payer: { email, first_name: name.split(' ')[0], last_name: name.split(' ').slice(1).join(' ') || name.split(' ')[0], identification: { type: 'CPF', number: cpf } },
        transactions: { payments: [payment] }
      })
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.message || data.error || 'Mercado Pago recusou a criação do pagamento.', details: data });
    const p = data.transactions?.payments?.[0] || data.transaction?.payments?.[0] || data.payments?.[0] || {};
    const pm = p.payment_method || {};
    return res.status(200).json({
      id: data.id || p.id,
      status: p.status || data.status,
      qr_code: pm.qr_code,
      qr_code_base64: pm.qr_code_base64,
      ticket_url: pm.ticket_url,
      order_id: data.id
    });
  } catch (e) { return res.status(500).json({ error: e.message || 'Erro interno.' }); }
};
