import type { ContentBlock } from '../types';

interface QuickQuestion {
  question: string;
  answer: ContentBlock[];
}

export const quickQuestionsData: QuickQuestion[] = [
  {
    question: "¿Qué es el compostaje?",
    answer: [
      { type: 'text', text: "El compostaje es un proceso natural en el que los residuos orgánicos (como restos de frutas, verduras y hojas) se descomponen para crear un abono rico en nutrientes llamado compost, ¡ideal para las plantas!" }
    ]
  },
  {
    question: "¿Puedo reciclar envases de vidrio rotos?",
    answer: [
      { type: 'text', text: "Por seguridad, no se deben depositar vidrios rotos en los Puntos Verdes. Pueden causar accidentes a los operarios. Lo ideal es envolverlos en papel grueso y desecharlos con cuidado en la basura común." }
    ]
  },
  {
    question: "¿Qué hago con el aceite de cocina usado?",
    answer: [
      { type: 'text', text: "¡Nunca lo tires por el desagüe! Un litro de aceite contamina 1.000 litros de agua. Lo correcto es guardarlo en una botella de plástico bien cerrada y llevarlo a puntos de recolección específicos." }
    ]
  },
  {
    question: "¿Son reciclables los cartones de leche o jugo (tetrabrik)?",
    answer: [
      { type: 'text', text: "Sí, los envases de tetrabrik son reciclables. Están compuestos de cartón, plástico y aluminio. Se deben enjuagar, aplastar y depositar en el contenedor de papel y cartón. Un proceso especial se encarga de separar sus componentes." }
    ]
  },
  {
    question: "¿Por qué es importante separar los residuos en casa?",
    answer: [
      { type: 'text', text: "Separar en origen es el paso más importante del reciclaje. Permite que los materiales lleguen más limpios a las plantas de tratamiento, facilitando su clasificación y asegurando que se puedan convertir en nuevos productos de calidad." }
    ]
  },
  {
    question: "¿Qué significa 'reducir, reutilizar, reciclar'?",
    answer: [
      { type: 'text', text: "Es la regla de las '3 R', y es jerárquica:" },
      { type: 'list', items: ["Reducir: El paso más importante. Consumir menos y evitar productos con mucho embalaje.", "Reutilizar: Darle una segunda vida a los objetos en lugar de desecharlos.", "Reciclar: Cuando no se puede reducir ni reutilizar, transformar el residuo en un nuevo producto."] }
    ]
  },
  {
    question: "¿Se pueden reciclar las bolsas de plástico?",
    answer: [
      { type: 'text', text: "Depende del tipo. Las bolsas de supermercado (tipo camiseta) se pueden reciclar si están limpias y secas. Agrúpalas todas dentro de una sola bolsa. Sin embargo, lo mejor es siempre reducir su uso llevando tu propia bolsa de tela." }
    ]
  },
  {
    question: "¿Qué es la economía circular?",
    answer: [
      { type: 'text', text: "Es un modelo de producción y consumo que busca que los productos y materiales mantengan su utilidad y valor el mayor tiempo posible. En lugar del modelo de 'usar y tirar', se enfoca en reutilizar, reparar, renovar y reciclar." }
    ]
  },
  {
    question: "¿Qué tipo de papel no se puede reciclar?",
    answer: [
      { type: 'text', text: "No todo el papel es igual. No se pueden reciclar:" },
      { type: 'list', items: ["Papel de cocina o servilletas usadas.", "Papel carbónico o fotográfico.", "Papel encerado o plastificado."] }
    ]
  },
  {
    question: "¿Es necesario lavar los envases antes de reciclarlos?",
    answer: [
      { type: 'text', text: "Sí, es muy importante. Enjuagar los envases de plástico, vidrio y metal evita malos olores, la aparición de plagas y, lo más importante, previene la contaminación de otros materiales limpios como el papel y el cartón." }
    ]
  },
  {
    question: "¿Qué se hace con el material reciclado?",
    answer: [
      { type: 'text', text: "Se convierte en materia prima para fabricar nuevos productos. Por ejemplo, las botellas de plástico se transforman en fibra textil para ropa o alfombras, el vidrio en nuevas botellas, y el papel en nuevas cajas de cartón." }
    ]
  },
  {
    question: "¿Qué es un 'Punto Verde'?",
    answer: [
      { type: 'text', text: "Un Punto Verde es un lugar físico, como un contenedor o un centro de acopio, donde los vecinos pueden llevar sus materiales reciclables ya separados. Es el nexo entre tu hogar y la planta de reciclaje." },
      { type: 'link', title: "Encontrar mi Punto Verde más cercano", url: "#puntos-verdes" }
    ]
  },
  {
    question: "¿Tengo que quitar las tapas de las botellas de plástico?",
    answer: [
      { type: 'text', text: "¡Sí! Las tapas y las botellas suelen estar hechas de plásticos diferentes. Es mejor reciclarlas por separado. ¡Juntá todas las tapitas en una botella para que no se pierdan!" }
    ]
  },
  {
    question: "¿Las latas de aerosol se pueden reciclar?",
    answer: [
      { type: 'text', text: "Sí, los aerosoles de metal (como desodorantes o insecticidas) son reciclables, pero es CRUCIAL que estén completamente vacíos. Se depositan en el contenedor de metales." }
    ]
  },
  {
    question: "¿Qué hago con los residuos electrónicos (e-waste)?",
    answer: [
      { type: 'text', text: "Los aparatos electrónicos como celulares, computadoras o cargadores no van a la basura común. Contienen materiales valiosos y también tóxicos. Deben llevarse a puntos de recolección especiales para 'RAEE' (Residuos de Aparatos Eléctricos y Electrónicos)." }
    ]
  },
  {
    question: "¿Qué beneficios tiene el reciclaje para Formosa?",
    answer: [
      { type: 'text', text: "Reciclar en nuestra ciudad ayuda a reducir la cantidad de basura que va al vertedero, ahorra recursos naturales, disminuye la contaminación, genera empleo en la industria del reciclaje y nos permite construir una comunidad más limpia y sostenible." }
    ]
  },
  {
    question: "¿Cómo puedo reducir el uso de plástico en mi día a día?",
    answer: [
      { type: 'text', text: "¡Pequeños cambios hacen una gran diferencia! Puedes:" },
      { type: 'list', items: ["Usar bolsas de tela para las compras.", "Llevar tu propia botella de agua reutilizable.", "Elegir productos con menos embalaje o a granel.", "Decir 'no' a los sorbetes o pajitas de plástico."] }
    ]
  },
  {
    question: "¿El telgopor (EPS) es reciclable?",
    answer: [
      { type: 'text', text: "Técnicamente es reciclable, pero su proceso es complejo y costoso porque es 95% aire. La mayoría de los sistemas de reciclaje municipales, incluido el nuestro por ahora, no lo aceptan. Lo mejor es evitar su consumo." }
    ]
  },
  {
    question: "¿Qué significan los números en los plásticos?",
    answer: [
      { type: 'text', text: "Ese número, dentro de un triángulo de flechas, es el Código de Identificación de Resina. Indica el tipo de plástico del que está hecho el envase. Los más comunes y fáciles de reciclar son el 1 (PET) y el 2 (HDPE)." }
    ]
  },
  {
    question: "¿Los tickets y recibos se pueden reciclar?",
    answer: [
      { type: 'text', text: "Lamentablemente, no. La mayoría de los tickets están impresos en 'papel térmico', que contiene químicos que no son aptos para el reciclaje de papel. Deben ir a la basura común." }
    ]
  },
  {
    question: "¿Qué hago con la ropa vieja o en mal estado?",
    answer: [
      { type: 'text', text: "La ropa es un residuo textil. Si está en buen estado, la mejor opción es donarla. Si está rota, puedes reutilizarla como trapos de limpieza. Actualmente, el reciclaje textil a gran escala es limitado en nuestra zona." }
    ]
  },
  {
    question: "¿Cómo puedo participar en las iniciativas de Formosa Recicla?",
    answer: [
      { type: 'text', text: "¡Nos encanta tu entusiasmo! Puedes empezar por separar tus residuos. También puedes seguirnos en nuestras redes sociales para enterarte de eventos, talleres y jornadas de voluntariado. ¡Tu participación es clave!" },
      { type: 'link', title: "Visitar la sección de Comunidad", url: "#comunidad" }
    ]
  },
  {
    question: "¿Reciclar realmente hace la diferencia?",
    answer: [
      { type: 'text', text: "¡Absolutamente! Cada botella, lata o papel que reciclas contribuye a un esfuerzo colectivo masivo. Juntos, ahorramos energía, conservamos recursos naturales, reducimos la contaminación y creamos un futuro más sostenible. ¡Cada gesto cuenta!" }
    ]
  },
  {
    question: "¿Qué es la 'basura cero'?",
    answer: [
      { type: 'text', text: "Es una filosofía de vida que busca reducir al máximo la generación de residuos. El objetivo es que casi nada de lo que consumimos termine en un vertedero, a través de la reducción, la reutilización, el compostaje y el reciclaje." }
    ]
  },
  {
    question: "¿Los espejos se reciclan con el vidrio?",
    answer: [
      { type: 'text', text: "No. Los espejos tienen una capa de metal en la parte posterior y están hechos de un tipo de vidrio diferente al de los envases. No se pueden reciclar junto con las botellas y frascos." }
    ]
  },
  {
    question: "¿Las servilletas de papel usadas van al contenedor de papel?",
    answer: [
      { type: 'text', text: "No, las servilletas, el papel de cocina o los pañuelos usados no deben ir al contenedor de papel. Al estar sucios con restos de comida o fluidos, contaminan el material. Si tienes compostera, ¡pueden ir allí!" }
    ]
  },
  {
    question: "¿Qué es el supra-reciclaje o 'upcycling'?",
    answer: [
      { type: 'text', text: "Es el arte de transformar un residuo o un objeto viejo en un nuevo producto de mayor valor o calidad. Por ejemplo, convertir una botella de vidrio en una lámpara o un neumático en un asiento. ¡Es creatividad en acción!" }
    ]
  },
  {
    question: "¿Cómo puedo armar mi propio tacho de reciclaje en casa?",
    answer: [
      { type: 'text', text: "¡Es muy simple! No necesitas nada especial. Con dos cajas o tachos es suficiente. Uno para los residuos 'húmedos' (orgánicos y basura) y otro para los 'secos' (plástico, vidrio, metal, papel). Lo importante es mantener los reciclables limpios y secos." }
    ]
  },
  {
    question: "¿Qué pasa si pongo algo incorrecto en el contenedor de reciclaje?",
    answer: [
      { type: 'text', text: "Se llama 'contaminación'. Un solo envase sucio o un material no reciclable puede arruinar un lote entero de material limpio, haciendo que todo termine en el vertedero. Por eso es tan importante separar bien." }
    ]
  },
  {
    question: "¿Los medicamentos vencidos se pueden reciclar?",
    answer: [
      { type: 'text', text: "No, y es muy importante no tirarlos a la basura ni al inodoro. Contienen químicos que pueden contaminar el agua y el suelo. Llévalos a farmacias o centros de salud que tengan programas de recolección de medicamentos." }
    ]
  },
  {
    question: "¿Qué es un residuo orgánico?",
    answer: [
      { type: 'text', text: "Son todos los residuos de origen natural que se descomponen, como cáscaras de frutas y verduras, restos de comida, yerba mate, saquitos de té, hojas secas, etc. Son la base para hacer compost." }
    ]
  },
  {
    question: "¿Las colillas de cigarrillo son biodegradables?",
    answer: [
      { type: 'text', text: "No, los filtros de los cigarrillos están hechos de acetato de celulosa, un tipo de plástico. Tardan años en descomponerse y liberan toxinas en el ambiente. Son uno de los contaminantes más comunes en el mundo." }
    ]
  },
  {
    question: "¿Cuál es el material más reciclado del mundo?",
    answer: [
      { type: 'text', text: "El acero es el material más reciclado del planeta. Gracias a sus propiedades magnéticas, es muy fácil de separar de otros residuos. Además, no pierde calidad al ser reciclado." }
    ]
  },
  {
    question: "¿Qué hago con los muebles viejos?",
    answer: [
      { type: 'text', text: "Antes de tirarlos, considera si se pueden donar, vender o restaurar. Si no es posible, consulta con el servicio de recolección de residuos voluminosos de tu municipio, ya que no deben dejarse en la calle." }
    ]
  },
  {
    question: "¿Cómo sé qué días pasa el recolector de reciclables?",
    answer: [
      { type: 'text', text: "La información sobre los horarios y rutas de la recolección diferenciada suele estar disponible en la página web de tu municipalidad o en nuestras redes sociales. ¡Mantente informado!" }
    ]
  },
  {
    question: "¿Puedo llevar mis reciclables directamente a algún lado?",
    answer: [
      { type: 'text', text: "¡Claro que sí! Esa es la función de los Puntos Verdes. Si tienes una cantidad considerable o simplemente prefieres llevarlos tú mismo, puedes acercarte al Punto Verde más cercano a tu domicilio." },
      { type: 'link', title: "Buscar Puntos Verdes", url: "#puntos-verdes" }
    ]
  },
  {
    question: "¿Hay talleres o charlas sobre reciclaje en Formosa?",
    answer: [
      { type: 'text', text: "Sí, constantemente organizamos y difundimos eventos educativos para todas las edades. Para estar al día, te recomendamos visitar nuestra sección de Noticias o seguirnos en nuestras redes sociales." },
      { type: 'link', title: "Ver últimas Noticias", url: "#noticias" }
    ]
  },
  {
    question: "¿Qué diferencia hay entre biodegradable y compostable?",
    answer: [
      { type: 'text', text: "Biodegradable significa que un material puede ser descompuesto por microorganismos, pero puede tardar mucho tiempo y dejar residuos. Compostable es más específico: se descompone en condiciones de compostaje en un tiempo determinado y se convierte en abono de calidad sin dejar residuos tóxicos." }
    ]
  },
  {
    question: "¿Por qué no se pueden reciclar los plásticos de un solo uso?",
    answer: [
      { type: 'text', text: "Muchos plásticos de un solo uso, como cubiertos o sorbetes, son técnicamente reciclables, pero su pequeño tamaño y bajo peso hacen que su recolección y clasificación sean muy difíciles y poco rentables. Por eso, la clave es 'reducir' su uso." }
    ]
  },
  {
    question: "¿Qué es la huella de carbono y cómo la reduce el reciclaje?",
    answer: [
      { type: 'text', text: "La huella de carbono es la cantidad total de gases de efecto invernadero que emitimos. El reciclaje la reduce significativamente porque fabricar productos con materiales reciclados requiere mucha menos energía (y por lo tanto, quema menos combustibles fósiles) que fabricarlos desde cero con materias primas vírgenes." }
    ]
  }
];
