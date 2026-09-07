module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido.' });
  const publicKey = process.env.MP_PUBLIC_KEY || '';
  if (!publicKey) return res.status(503).json({ error: 'MP_PUBLIC_KEY não configurada no Vercel.' });
  return res.status(200).json({ publicKey });
};
