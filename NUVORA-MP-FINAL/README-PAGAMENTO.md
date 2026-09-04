# NUVORA — Checkout Transparente Mercado Pago

Esta versão mantém o visual da NUVORA e troca o Checkout Pro por um checkout dentro do próprio site.

## O que foi preparado
- Página `checkout.html` dentro da NUVORA.
- Pix com QR Code e código copia e cola na própria página.
- Cartão de crédito/débito usando o Card Payment Brick oficial do Mercado Pago.
- Dados do cartão são tokenizados pelo Mercado Pago; a NUVORA não armazena o número do cartão.
- Consulta de status do pagamento Pix em `/api/payment-status`.
- Webhook em `/api/webhook`.
- Backend serverless para criar pagamentos em `/api/create-payment`.

## Configuração na Vercel
Crie estas variáveis em Settings → Environment Variables:
- `MP_ACCESS_TOKEN` = Access Token privado da aplicação Mercado Pago.
- `MP_PUBLIC_KEY` = Public Key da mesma aplicação.
- `SITE_URL` = endereço público da NUVORA, por exemplo `https://nuvorasite.vercel.app`.

Nunca coloque `MP_ACCESS_TOKEN` no HTML/JavaScript do navegador.

## Importante
O código está preparado para Checkout Transparente usando a API de pagamentos e Checkout Bricks. Antes de vendas reais, faça os testes do Mercado Pago e troque as credenciais de teste pelas credenciais de produção. O Mercado Pago recomenda atualmente Orders API para novas integrações, enquanto a documentação dos Bricks também documenta o envio de pagamentos pela API de pagamentos.

Os preços atuais são os valores demonstrativos do projeto. Edite `data/products.json` antes de vender.
