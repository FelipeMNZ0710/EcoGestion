
const materialsContent = {
  papel: {
    yes: [
      { text: "Diarios, revistas y folletos", icon: "📰" },
      { text: "Cajas de cartón (desarmadas)", icon: "📦" },
      { text: "Papel de oficina y cuadernos (sin espiral)", icon: "📄" },
      { text: "Sobres (sin ventana de plástico)", icon: "✉️" },
      { text: "Envases de cartón para huevos", icon: "🥚" },
    ],
    no: [
      { text: "Papel de cocina o servilletas usadas", icon: "🧻" },
      { text: "Cajas de pizza con grasa", icon: "🍕" },
      { text: "Papel fotográfico o encerado", icon: "🖼️" },
      { text: "Tickets y facturas (papel térmico)", icon: "🧾" },
      { text: "Vasos de cartón para bebidas (plastificados)", icon: "☕" },
    ],
    tip: "Asegúrate de que todo el papel y cartón esté limpio y seco. La humedad y la grasa arruinan el proceso de reciclaje.",
    quiz: {
      points: 50,
      questions: [
        { question: "¿Se puede reciclar una caja de pizza manchada de aceite?", options: ['Sí, completa', 'Solo las partes limpias', 'No, nunca'], correctAnswer: 1 },
        { question: "¿Qué debes hacer con las cajas de cartón grandes?", options: ['Dejarlas armadas', 'Desarmarlas y aplanarlas', 'Mojarlas para que ocupen menos'], correctAnswer: 1 },
      ],
    },
    commonMistakes: [
        "Intentar reciclar servilletas o pañuelos de papel usados.",
        "Dejar espirales metálicos en los cuadernos.",
        "No desarmar las cajas de cartón, ocupando mucho espacio."
    ],
    recyclingProcess: [
        { step: 1, title: 'Recolección y Clasificación', description: 'El papel y cartón se recogen y se separan por tipo y calidad en la planta de reciclaje.', icon: '🚚' },
        { step: 2, title: 'Fabricación de Pulpa', description: 'Se mezcla con agua para crear una pulpa. Se eliminan tintas, grapas y otros contaminantes.', icon: '💧' },
        { step: 3, title: 'Secado y Prensado', description: 'La pulpa limpia se extiende, se le quita el agua, se prensa y se seca para formar nuevas hojas de papel.', icon: '📰' },
        { step: 4, title: 'Nuevo Producto', description: 'El papel reciclado se convierte en nuevos productos como cajas de cartón, periódicos o papel higiénico.', icon: '♻️' }
    ],
    impactStats: [
        { stat: 'Árboles Salvados', value: '17', icon: '🌳' },
        { stat: 'Agua Ahorrada', value: '26k L', icon: '💧' },
        { stat: 'Energía Reducida', value: '60%', icon: '⚡' }
    ]
  },
  plastico: {
    yes: [
      { text: "Botellas de bebidas (agua, gaseosa, jugo)", icon: "🍾" },
      { text: "Envases de productos de limpieza (lavandina, shampoo)", icon: "🧴" },
      { text: "Potes de yogurt, queso crema y postres", icon: "🍦" },
      { text: "Tapas de botellas y envases", icon: "🔵" },
      { text: "Bolsas de plástico limpias (agrupadas)", icon: "🛍️" },
    ],
    no: [
      { text: "Cubiertos y vasos descartables", icon: "🍴" },
      { text: "Paquetes de snacks (papitas, galletitas)", icon: "🥨" },
      { text: "Juguetes de plástico", icon: "🧸" },
      { text: "Biromes y cepillos de dientes", icon: "🖊️" },
      { text: "Envases con restos de comida", icon: "🍔" },
    ],
    tip: "Enjuaga y aplasta las botellas para ahorrar espacio y facilitar el transporte. ¡No olvides reciclar las tapas por separado!",
     quiz: {
      points: 50,
      questions: [
        { question: "¿Qué significa el número dentro del triángulo en los plásticos?", options: ['Cuántas veces se recicló', 'El tipo de plástico que es', 'La fecha de vencimiento'], correctAnswer: 1 },
        { question: "¿Cuál es el primer paso antes de reciclar una botella?", options: ['Quitar la etiqueta', 'Enjuagarla y aplastarla', 'Romperla'], correctAnswer: 1 },
      ],
    },
    commonMistakes: [
        "Tirar envases sin enjuagar.",
        "Mezclar plásticos reciclables con los que no lo son.",
        "Dejar las botellas con líquido adentro."
    ],
    recyclingProcess: [
        { step: 1, title: 'Separación y Limpieza', description: 'Los plásticos se separan por tipo (número) y color. Luego se lavan para eliminar impurezas.', icon: '🧼' },
        { step: 2, title: 'Trituración', description: 'Una vez limpios, se trituran en pequeños trozos llamados "escamas" o "pellets".', icon: '⚙️' },
        { step: 3, title: 'Fundición y Moldeado', description: 'Las escamas se funden y se moldean para formar nuevos productos.', icon: '🔥' },
        { step: 4, title: 'Nuevo Producto', description: 'Se convierten en ropa, muebles, alfombras, tuberías o nuevas botellas.', icon: '♻️' }
    ],
    impactStats: [
        { stat: 'Años en Descomponerse', value: '100+', icon: '⏳' },
        { stat: 'Reciclado Mundial', value: '~9%', icon: '🌍' },
        { stat: 'Remeras por 25 botellas', value: '1', icon: '👕' }
    ]
  },
  vidrio: {
    yes: [
      { text: "Botellas de vino, cerveza, gaseosa", icon: "🍾" },
      { text: "Frascos de mermelada, conservas, café", icon: "🫙" },
      { text: "Botellas de perfume (sin tapa)", icon: "🌸" },
    ],
    no: [
      { text: "Espejos rotos", icon: "🪞" },
      { text: "Vasos de cristal o copas", icon: "🍷" },
      { text: "Bombillas de luz", icon: "💡" },
      { text: "Cerámica o platos rotos", icon: "🍽️" },
      { text: "Ventanas o vidrio plano", icon: "🖼️" },
    ],
    tip: "No es necesario quitar las etiquetas de papel de las botellas, se queman en el proceso. Solo asegúrate de que estén vacías y enjuagadas.",
    quiz: {
      points: 50,
      questions: [
        { question: "¿Cuántas veces se puede reciclar el vidrio?", options: ['Una vez', 'Diez veces', 'Infinitas veces'], correctAnswer: 2 },
        { question: "Si se te rompe un plato de cerámica, ¿dónde lo tiras?", options: ['En el contenedor de vidrio', 'En la basura común', 'En el contenedor de plásticos'], correctAnswer: 1 },
      ],
    },
    commonMistakes: [
        "Tirar espejos, cerámica o cristal junto con el vidrio.",
        "Dejar tapas o corchos en las botellas.",
        "Intentar reciclar vidrios de ventanas (tienen otra composición)."
    ],
    recyclingProcess: [
        { step: 1, title: 'Recolección', description: 'El vidrio se recoge y transporta a la planta de tratamiento, generalmente separado por color (verde, ámbar, transparente).', icon: '🚚' },
        { step: 2, title: 'Limpieza y Trituración', description: 'Se eliminan impurezas y se tritura el vidrio hasta convertirlo en trozos pequeños llamados "calcín".', icon: '🔨' },
        { step: 3, title: 'Fundición', description: 'El calcín se funde en un horno a altas temperaturas junto con nueva materia prima.', icon: '🔥' },
        { step: 4, title: 'Moldeado y Creación', description: 'El vidrio fundido se vierte en moldes para crear nuevas botellas y frascos listos para usar.', icon: '♻️' }
    ],
    impactStats: [
        { stat: 'Calidad', value: '100%', icon: '💎' },
        { stat: 'Energía Ahorrada', value: '40%', icon: '⚡' },
        { stat: 'Veces Reciclable', value: '∞', icon: '🔄' }
    ]
  },
  metales: {
    yes: [
      { text: "Latas de gaseosa, cerveza (aluminio)", icon: "🥤" },
      { text: "Latas de conserva (atún, tomate, arvejas)", icon: "🥫" },
      { text: "Tapas de metal de frascos y botellas", icon: "🔩" },
      { text: "Aerosoles vacíos (desodorante, insecticida)", icon: "💨" },
      { text: "Papel de aluminio limpio y compactado", icon: " Foil " },
    ],
    no: [
      { text: "Pilas y baterías", icon: "🔋" },
      { text: "Envases de pintura o productos tóxicos", icon: "🎨" },
      { text: "Electrodomésticos pequeños", icon: "🔌" },
      { text: "Caños o alambres de construcción", icon: "⛓️" },
    ],
    tip: "Enjuaga las latas de conserva y, si es posible, aplasta las de aluminio. Junta el papel de aluminio en una bola grande para que no se pierda.",
    quiz: {
      points: 50,
      questions: [
        { question: "¿Cuál es el metal más reciclado del planeta?", options: ['Aluminio', 'Acero', 'Cobre'], correctAnswer: 1 },
        { question: "¿Qué debes hacer con las pilas?", options: ['Tirarlas con los metales', 'Tirarlas a la basura común', 'Llevarlas a un punto de recolección especial'], correctAnswer: 2 },
      ],
    },
     commonMistakes: [
        "Tirar pilas o baterías en el contenedor de metales.",
        "No enjuagar las latas de conserva.",
        "Dejar aerosoles con contenido adentro."
    ],
    recyclingProcess: [
        { step: 1, title: 'Separación Magnética', description: 'En la planta, un gran imán separa los metales férricos (acero) de los no férricos (aluminio).', icon: '🧲' },
        { step: 2, title: 'Prensado', description: 'Los metales se prensan en grandes bloques para facilitar su transporte a las fundiciones.', icon: '🧱' },
        { step: 3, title: 'Fundición y Purificación', description: 'Cada tipo de metal se funde en un horno para eliminar impurezas y se vierte en moldes.', icon: '🔥' },
        { step: 4, title: 'Nuevos Productos', description: 'El metal líquido se convierte en láminas o lingotes para fabricar nuevas latas, partes de autos o electrodomésticos.', icon: '♻️' }
    ],
    impactStats: [
        { stat: 'Energía Ahorrada (Al)', value: '95%', icon: '⚡' },
        { stat: 'Acero en uso', value: '~75%', icon: '🏗️' },
        { stat: 'Veces Reciclable', value: '∞', icon: '🔄' }
    ]
  }
};

module.exports = materialsContent;
