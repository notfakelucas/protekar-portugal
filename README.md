# ProTekar Portugal 🇵🇹

Website da **ProTekar Portugal** — Tapetes 3D premium feitos à medida para automóveis.

## Funcionalidades
- Landing page dark premium com acentos dourados (Space Grotesk / Sora / Inter)
- Bloco de oferta com preço fixo configurável (`KIT_PRICE` em `app.js`)
- Configurador de veículos com 45 marcas presentes em Portugal (modelos até 2026)
- Fotos ampliáveis (lightbox) na oferta, carrossel, detalhes e avaliações
- Comparador antes/depois deslizante e tabela ProTekar vs comum
- Carrossel de fotos do produto instalado e detalhes técnicos
- Secção de avaliações preenchida a partir de `reviews.js` (oculta enquanto estiver vazia)
- Perguntas frequentes, barra de compra fixa e design responsivo

## Tecnologias
- HTML5 semântico
- CSS3 (Variáveis CSS, Grid, Flexbox, Animações)
- JavaScript Vanilla (ES6+)
- Google Fonts (Inter)

## Como executar
Basta abrir o `index.html` num navegador ou utilizar um servidor local:

```bash
# Com Python
python3 -m http.server 8080

# Com Node.js
npx serve .
```

## Checkout e pagamentos
O checkout (`checkout.html`) cria o pagamento no **Stripe** através da função `api/checkout.js` (Vercel).

1. Crie uma conta no Stripe e copie a chave secreta (`sk_test_...` para testes, `sk_live_...` em produção).
2. Na Vercel → projeto → Settings → Environment Variables, adicione `STRIPE_SECRET_KEY`.
3. Opcional: `SITE_URL` (ex.: `https://protekar-portugal.vercel.app`).
4. Ative MB WAY e Multibanco em Stripe → Settings → Payment methods.
5. Redeploy. As encomendas aparecem no painel do Stripe com veículo, telemóvel e morada.

Preços, envios, extras e textos: `checkout-config.json` (valores em cêntimos, IVA incluído).
`compareAt` e `promoEndsAt` só devem ser preenchidos com um preço anterior e uma data de fim reais.

## Estrutura
```
protekar-portugal/
├── index.html    # Estrutura HTML completa
├── index.css     # Estilos e sistema de design
├── app.js        # Lógica da aplicação (KIT_PRICE, CHECKOUT_URL)
├── reviews.js    # Avaliações reais de clientes de Portugal
├── checkout.html # Checkout (checkout.css, checkout.js)
├── checkout-config.json # Preços, envios, extras e textos do checkout
├── obrigado.html # Página após o pagamento
├── api/checkout.js # Função serverless que cria a sessão do Stripe
├── images/       # Fotos do produto
└── README.md     # Este ficheiro
```

## Contacto
- Email: suporte@protekar.pt
- Localização: Lisboa, Portugal

© 2026 ProTekar Portugal · Todos os direitos reservados
