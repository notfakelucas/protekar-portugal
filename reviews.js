/* ========================================
   Avaliações de clientes de Portugal
   ----------------------------------------
   A secção "O que dizem os nossos clientes" só aparece quando este
   array tem pelo menos uma avaliação; a nota média é calculada
   automaticamente a partir delas.

   Campos:
     foto       Foto do produto instalado (images/...)
     producto   Etiqueta opcional sobre a foto (ex.: "Tapete de bagageira")
     nota       1–5
     texto      Texto da avaliação
     nombre     Nome mostrado
     detalle    Opcional: idade / cidade
     avatar     Opcional: foto de perfil (images/...)
     verificada true se a avaliação estiver ligada a uma encomenda real
   ======================================== */

const REVIEWS = [
    {
        foto: 'images/cliente-1.png',
        producto: 'Tapete de Bagageira Premium',
        nota: 5,
        texto: 'Vejam esta foto, é exatamente assim que chegou. Sem emendas, rebordos altíssimos que seguram qualquer líquido. Uso o carro todos os dias e continua intacto. A minha mulher ficou impressionada. É só lavar com mangueira e fica como novo. Recomendo vivamente.',
        nombre: 'Tiago Fernandes',
        detalle: '38 anos · Lisboa',
        verificada: true
    },
    {
        foto: 'images/cliente-2.png',
        producto: 'Tapetes dianteiros',
        nota: 5,
        texto: 'Reparem na foto, os ilhós de origem encaixam nos pinos certinhos e o tapete não se mexe. O rebordo elevado é este que se vê. Entornei café e não foi uma gota para a alcatifa. Parece que saiu de fábrica.',
        nombre: 'Nuno Silva',
        detalle: '32 anos · Porto',
        verificada: true
    },
    {
        foto: 'images/cliente-3.webp',
        producto: 'Tapete de bagageira',
        nota: 5,
        texto: 'Este da foto é a minha bagageira. Cobertura total, os rebordos sobem nas laterais. Carrinho de bebé, compras, o cão, tanto faz. É só sacudir e fica limpo. Nunca mais vou querer outro.',
        nombre: 'Mariana Costa',
        detalle: '34 anos · Coimbra',
        verificada: true
    },
    {
        foto: 'images/cliente-4.webp',
        producto: 'Tapete traseiro inteiriço',
        nota: 5,
        texto: 'Este é o tapete traseiro do meu carro. Inteiriço, sem emendas, cobre tudo de lateral a lateral. O meu filho entorna bolachas, sumo, tanto faz. É só levantar e lavar. Já recomendei a três amigos e todos compraram.',
        nombre: 'Pedro Almeida',
        detalle: '28 anos · Braga',
        verificada: true
    }
];
