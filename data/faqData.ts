import type { ContentBlock } from '../types';

interface FAQ {
  question: string;
  answer: ContentBlock[];
}

export const faqData: FAQ[] = [
  {
    question: "¿Qué plásticos puedo reciclar?",
    answer: [
      {
        type: 'text',
        text: "¡Buena pregunta! Generalmente, podés reciclar los plásticos que tienen los números 1 (PET) y 2 (HDPE). Estos incluyen:"
      },
      {
        type: 'list',
        items: [
          "Botellas de gaseosa, agua y aceite.",
          "Envases de productos de limpieza (lavandina, detergente).",
          "Potes de yogurt, crema y postres.",
          "Tapas de botellas."
        ]
      },
      {
        type: 'text',
        text: "Recordá siempre enjuagarlos y aplastarlos para que ocupen menos espacio. Para más detalles, visitá nuestra guía."
      },
      {
        type: 'link',
        title: 'Ver la Guía Completa de Plásticos',
        url: '#como-reciclar'
      }
    ]
  },
  {
    question: "¿Cómo reciclo el cartón de pizza?",
    answer: [
      {
        type: 'text',
        text: "El cartón de pizza es un caso especial. Si la caja tiene manchas de grasa o restos de comida, esa parte no se puede reciclar porque contamina el resto del papel."
      },
      {
        type: 'text',
        text: "Lo correcto es cortar y reciclar solo las partes limpias de la caja (generalmente la tapa) y desechar la base manchada con la basura común."
      }
    ]
  },
    {
    question: "¿Las bombillas de luz se reciclan?",
    answer: [
      {
        type: 'text',
        text: "No, las bombillas de luz o focos no se reciclan con el vidrio común. Las bombillas de bajo consumo (fluorescentes) contienen mercurio y deben llevarse a puntos de recolección de residuos peligrosos."
      },
       {
        type: 'text',
        text: "Las bombillas LED son más seguras, pero tampoco son reciclables en los contenedores normales. ¡Lo mejor es buscar puntos específicos para residuos electrónicos!"
      }
    ]
  },
  {
    question: "¿Dónde encuentro los Puntos Verdes?",
    answer: [
      {
        type: 'text',
        text: "¡Es muy fácil! Tenemos un mapa interactivo y un listado completo de todos los Puntos Verdes de la ciudad en nuestra sección dedicada."
      },
      {
        type: 'link',
        title: 'Ir al Mapa de Puntos Verdes',
        url: '#puntos-verdes'
      }
    ]
  }
];
