module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido.' });
  const token = process.env.MP_ACCESS_TOKEN;
  const id = req.query && req.query.id;
  if (!token) return res.status(500).json({ error: 'MP_ACCESS_TOKEN não configurado.' });
  if (!id) return res.status(400).json({ error: 'ID ausente.' });
  try {
    const r = await fetch(`https://api.mercadopago.com/v1/orders/${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${token}` } });
    const d = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: d.message || 'Não foi possível consultar o pedido.' });
    const p = d.transactions?.payments?.[0] || d.transaction?.payments?.[0] || d.payments?.[0] || {};
    res.status(200).json({ status: p.status || d.status || 'pending', status_detail: p.status_detail || d.status_detail || null, order: d.id });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
