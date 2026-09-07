# NUVORA — Checkout Transparente Mercado Pago

O projeto usa o Checkout Transparente via Orders API, com Card Payment Brick no cartão e Pix com QR Code/copia e cola.

## Variáveis no Vercel
- MP_PUBLIC_KEY — chave pública da aplicação Mercado Pago
- MP_ACCESS_TOKEN — Access Token privado, somente no servidor

A integração usa `MP_ACCESS_TOKEN` apenas nas Functions e `MP_PUBLIC_KEY` no navegador. Os dados completos do cartão não são armazenados pela NUVORA.

Documentação oficial: https://www.mercadopago.com.br/developers/pt/docs/checkout-api-orders/overview
