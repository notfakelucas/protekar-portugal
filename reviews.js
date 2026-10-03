/* ========================================
   Avaliações de clientes de Portugal
   ----------------------------------------
   Adicione aqui avaliações REAIS de clientes portugueses (com autorização).
   A secção "O que dizem os nossos clientes" só aparece quando este
   array tem pelo menos uma avaliação, e a nota média é calculada
   automaticamente a partir delas.

   Campos:
     foto       Foto do produto instalado enviada pelo cliente (images/...)
     producto   Etiqueta opcional sobre a foto (ex.: "Tapete de bagageira")
     nota       1–5
     texto      Texto da avaliação, tal como o cliente o escreveu
     nombre     Nome que o cliente autoriza mostrar (ex.: "Ana R.")
     detalle    Opcional: cidade ou outro dado que o cliente autorize
     avatar     Opcional: foto de perfil do cliente (images/...)
     verificada true apenas se a avaliação estiver ligada a uma encomenda real

   Exemplo (formato):
   {
       foto: 'images/avaliacao-ana.webp',
       producto: 'Tapete de bagageira',
       nota: 5,
       texto: '...',
       nombre: 'Ana R.',
       detalle: 'Braga',
       verificada: true
   }
   ======================================== */

const REVIEWS = [];
