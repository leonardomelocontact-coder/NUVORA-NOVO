function send(res,status,body){res.status(status).json(body);}
module.exports=async function handler(req,res){
  if(req.method!=='GET') return send(res,405,{error:'Método não permitido.'});
  if(!process.env.MP_ACCESS_TOKEN) return send(res,500,{error:'MP_ACCESS_TOKEN não configurado.'});
  const id=String(req.query?.id||''); if(!/^\d+$/.test(id)) return send(res,400,{error:'ID de pagamento inválido.'});
  try{const r=await fetch(`https://api.mercadopago.com/v1/payments/${id}`,{headers:{Authorization:`Bearer ${process.env.MP_ACCESS_TOKEN}`}});const d=await r.json();if(!r.ok)return send(res,r.status,{error:d.message||'Erro ao consultar pagamento.'});send(res,200,{id:d.id,status:d.status,status_detail:d.status_detail,amount:d.transaction_amount});}catch(e){send(res,500,{error:'Não foi possível consultar o pagamento.'});}
};
