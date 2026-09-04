const products = require('../data/products.json');
function send(res,status,body){res.status(status).json(body);}
function money(v){return Math.round(Number(v)*100)/100;}
module.exports = async function handler(req,res){
  if(req.method!=='POST') return send(res,405,{error:'Método não permitido.'});
  if(!process.env.MP_ACCESS_TOKEN) return send(res,500,{error:'MP_ACCESS_TOKEN não configurado no servidor.'});
  try{
    const b=req.body||{}; const p=products.find(x=>x.id===String(b.productId)); const qty=Number(b.quantity||1);
    if(!p||!Number.isFinite(p.price)||p.price<=0) return send(res,400,{error:'Produto ou preço inválido.'});
    if(!Number.isInteger(qty)||qty<1||qty>20) return send(res,400,{error:'Quantidade inválida.'});
    const customer=b.customer||{}; const email=String(customer.email||'').trim(); const name=String(customer.name||'').trim();
    if(!name||!email.includes('@')) return send(res,400,{error:'Nome e e-mail são obrigatórios.'});
    const method=String(b.paymentMethod||'').toLowerCase();
    if(!['pix','credit_card','debit_card'].includes(method)) return send(res,400,{error:'Meio de pagamento inválido.'});
    const amount=money(p.price*qty); const external=`NUVORA-${p.id}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    const body={transaction_amount:amount,description:p.name,payment_method_id:method,payer:{email,first_name:name.split(' ')[0],last_name:name.split(' ').slice(1).join(' ')||undefined},external_reference:external,notification_url:`${process.env.SITE_URL||`https://${req.headers.host}`}/api/webhook`};
    if(method==='pix'){
      body.payment_method_id='pix';
    } else {
      if(!b.token) return send(res,400,{error:'Token do cartão não recebido.'});
      body.token=b.token; body.installments=Number(b.installments||1); body.issuer_id=b.issuer_id||undefined;
      body.payment_method_id=b.payment_method_id||method;
      body.payer.identification={type:b.identificationType||'CPF',number:String(b.identificationNumber||'').replace(/\D/g,'')};
    }
    const r=await fetch('https://api.mercadopago.com/v1/payments',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${process.env.MP_ACCESS_TOKEN}`,'X-Idempotency-Key':external},body:JSON.stringify(body)});
    const data=await r.json(); if(!r.ok) return send(res,r.status,{error:data.message||'Mercado Pago recusou a solicitação.',detail:data.cause||data});
    return send(res,200,{id:data.id,status:data.status,status_detail:data.status_detail,amount:data.transaction_amount,qr_code:data.point_of_interaction?.transaction_data?.qr_code||null,qr_code_base64:data.point_of_interaction?.transaction_data?.qr_code_base64||null,ticket_url:data.point_of_interaction?.transaction_data?.ticket_url||null,external_reference:data.external_reference,installments:data.installments||1,payment_method_id:data.payment_method_id||method});
  }catch(e){console.error(e);return send(res,500,{error:'Não foi possível criar o pagamento.',detail:e.message});}
};
