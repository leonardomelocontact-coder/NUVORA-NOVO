module.exports=async function handler(req,res){
  if(req.method==='POST') console.log('Mercado Pago webhook:',JSON.stringify(req.body||{}));
  res.status(200).json({received:true});
};
