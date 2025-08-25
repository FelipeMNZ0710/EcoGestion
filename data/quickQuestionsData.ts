import type { ContentBlock } from '../types';

interface QuickQuestion {
  question: string;
  answer: ContentBlock[];
}

export const quickQuestionsData: QuickQuestion[] = [
  // --- Recycling Questions (Existing) ---
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
    question: "¿Cómo puedo participar en las iniciativas de EcoGestión?",
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
  },

  // --- App Functionality Questions ---
  {
    question: "¿Cómo encuentro un Punto Verde cerca mío?",
    answer: [
      { type: 'text', text: "Puedes usar el mapa interactivo en la sección 'Puntos Verdes'. Tu navegador podría pedirte tu ubicación para mostrarte los más cercanos." },
      { type: 'link', title: "Ir a Puntos Verdes", url: "#puntos-verdes" }
    ]
  },
  {
    question: "¿Qué significan los colores de los marcadores en el mapa?",
    answer: [
      { type: 'text', text: "Los colores indican el estado del Punto Verde: Verde (Operativo), Amarillo (Reportado con un problema), y Azul (En mantenimiento)." }
    ]
  },
  {
    question: "¿Cómo puedo filtrar los Puntos Verdes?",
    answer: [
      { type: 'text', text: "En la página 'Puntos Verdes', encima de la lista, hay botones para filtrar por el tipo de material que aceptan, como 'Plásticos' o 'Pilas'." }
    ]
  },
  {
    question: "¿Puedo ver los horarios de un Punto Verde?",
    answer: [
      { type: 'text', text: "¡Sí! Haz clic en cualquier Punto Verde de la lista o el mapa y se abrirá una ventana con todos sus detalles, incluyendo los horarios." }
    ]
  },
  {
    question: "¿Qué es 'Hacer Check-in' en un Punto Verde?",
    answer: [
      { type: 'text', text: "Es una forma de registrar tu visita. Al hacerlo, ganas EcoPuntos y nos ayudas a saber qué puntos son los más utilizados. ¡Solo puedes hacerlo si has iniciado sesión!" }
    ]
  },
  {
    question: "¿Para qué sirve el botón 'Reportar Problema'?",
    answer: [
      { type: 'text', text: "Si llegas a un Punto Verde y está lleno, sucio o dañado, puedes usar ese botón para notificarnos. Esto nos ayuda a mantener todo en orden y te da EcoPuntos por colaborar." }
    ]
  },
  {
    question: "¿Cómo guardo mis Puntos Verdes favoritos?",
    answer: [
      { type: 'text', text: "Al lado de cada Punto Verde en la lista, verás un ícono de estrella. Haz clic en él para añadirlo a tus favoritos y encontrarlo más fácilmente." }
    ]
  },
  {
    question: "Hice clic en un marcador del mapa y no pasa nada.",
    answer: [
      { type: 'text', text: "Al hacer clic en un marcador del mapa, la lista de la derecha se desplazará automáticamente para mostrarte esa ubicación. Asegúrate de mirar la lista para ver los detalles." }
    ]
  },
  {
    question: "¿Qué son los EcoPuntos?",
    answer: [
      { type: 'text', text: "Los EcoPuntos son una forma de recompensar tu participación. Los ganas realizando acciones positivas como visitar Puntos Verdes, jugar, completar cuestionarios o participar en la comunidad." }
    ]
  },
  {
    question: "¿Para qué sirven los EcoPuntos?",
    answer: [
      { type: 'text', text: "Acumular EcoPuntos te ayuda a desbloquear logros y a medir tu impacto positivo en la comunidad. ¡Es una forma divertida de ver tu progreso!" }
    ]
  },
  {
    question: "¿Cómo gano EcoPuntos?",
    answer: [
      { type: 'text', text: "Ganas puntos por: hacer check-in en Puntos Verdes, reportar problemas, participar en la comunidad, completar cuestionarios en la guía de reciclaje y jugar a los juegos." }
    ]
  },
  {
    question: "¿Qué son los Logros?",
    answer: [
      { type: 'text', text: "Son medallas virtuales que desbloqueas al alcanzar ciertas metas, como visitar 3 Puntos Verdes o completar todos los cuestionarios. ¡Colecciónalos todos!" }
    ]
  },
  {
    question: "¿Dónde puedo ver mis puntos y logros?",
    answer: [
      { type: 'text', text: "Toda tu información está en tu perfil. Haz clic en tu nombre en la parte superior derecha de la página para acceder." },
      { type: 'link', title: "Ir a mi Perfil", url: "#perfil" }
    ]
  },
  {
    question: "¿Los administradores ganan puntos?",
    answer: [
      { type: 'text', text: "No, para mantener el sistema justo, los usuarios administradores no participan en el sistema de EcoPuntos ni en los logros." }
    ]
  },
  {
    question: "¿Cuántos puntos gano por jugar?",
    answer: [
      { type: 'text', text: "La cantidad de puntos varía según el juego. ¡La mejor forma de saberlo es jugar y descubrirlo!" }
    ]
  },
  {
    question: "¿Qué es el 'Identificador de Residuos con IA'?",
    answer: [
      { type: 'text', text: "Es una herramienta que usa la cámara de tu celular. Le tomas una foto a un objeto y la inteligencia artificial de EcoBot te dirá qué es y cómo reciclarlo." },
      { type: 'link', title: "Probar el Identificador IA", url: "#como-reciclar" }
    ]
  },
  {
    question: "¿Necesito dar permiso para usar el Identificador con IA?",
    answer: [
      { type: 'text', text: "Sí, la primera vez que lo uses, tu navegador te pedirá permiso para acceder a tu cámara. Es necesario para que la función pueda tomar la foto." }
    ]
  },
  {
    question: "¿Para qué sirven los cuestionarios de la guía de reciclaje?",
    answer: [
      { type: 'text', text: "Son una forma rápida y divertida de poner a prueba lo que aprendiste sobre cada material. ¡Además, si los apruebas ganas EcoPuntos!" }
    ]
  },
  {
    question: "¿Cómo sé si ya completé un cuestionario?",
    answer: [
      { type: 'text', text: "En la página 'Cómo Reciclar', verás una barra de progreso. Los materiales cuyo cuestionario ya completaste aparecerán marcados." }
    ]
  },
  {
    question: "¿Qué es la sección 'Comunidad'?",
    answer: [
      { type: 'text', text: "Es nuestro foro de chat. Un lugar para hablar con otros miembros, hacer preguntas, compartir ideas y proyectos sobre reciclaje. ¡Como un Discord o un grupo de WhatsApp!" },
      { type: 'link', title: "Unirme a la Comunidad", url: "#comunidad" }
    ]
  },
  {
    question: "¿Qué significan los canales como #general o #dudas?",
    answer: [
      { type: 'text', text: "Son diferentes salas de chat para organizar las conversaciones. #general es para charlas variadas, #dudas para hacer preguntas, #proyectos para compartir ideas, etc." }
    ]
  },
  {
    question: "¿Puedo hablar con un administrador en la Comunidad?",
    answer: [
      { type: 'text', text: "¡Sí! Los usuarios con la etiqueta 'Admin' son parte del equipo de EcoGestión. Están allí para ayudar y moderar la conversación." }
    ]
  },
  {
    question: "¿Puedo editar o borrar mis mensajes en la Comunidad?",
    answer: [
      { type: 'text', text: "Sí, si pasas el mouse sobre tu propio mensaje, aparecerán las opciones para editarlo o borrarlo." }
    ]
  },
  {
    question: "¿Por qué no puedo escribir en el canal #anuncios?",
    answer: [
      { type: 'text', text: "El canal #anuncios es de solo lectura. Solo los administradores pueden publicar allí para asegurarse de que las noticias importantes no se pierdan." }
    ]
  },
  {
    question: "¿Necesito iniciar sesión para jugar?",
    answer: [
      { type: 'text', text: "Sí, para poder jugar y que tu puntaje y logros se guarden, necesitas haber iniciado sesión en tu cuenta." }
    ]
  },
  {
    question: "¿Gano algo por jugar?",
    answer: [
      { type: 'text', text: "¡Sí! Cada vez que completas un juego, ganas EcoPuntos que se suman a tu perfil." },
      { type: 'link', title: "Ir a los Juegos", url: "#juegos" }
    ]
  },
  {
    question: "¿Cómo cambio mi nombre de usuario?",
    answer: [
      { type: 'text', text: "Actualmente, no hay una opción para cambiar tu nombre directamente desde el perfil. Esta es una función que podríamos agregar en el futuro." }
    ]
  },
  {
    question: "¿Mi información es privada?",
    answer: [
      { type: 'text', text: "Tu perfil con tus puntos y logros es visible dentro de la comunidad para fomentar la participación, pero tu email y otros datos personales no se comparten." }
    ]
  },
  {
    question: "¿Qué pasa si olvido mi contraseña?",
    answer: [
      { type: 'text', text: "En la ventana de inicio de sesión, hay una opción que dice '¿Olvidaste tu contraseña?'. Haz clic ahí para iniciar el proceso de recuperación." }
    ]
  },
  {
    question: "¿Cómo cierro sesión?",
    answer: [
      { type: 'text', text: "En la parte superior derecha de la página, verás un botón que dice 'Cerrar Sesión' al lado de tu nombre." }
    ]
  },
  {
    question: "¿Qué es el 'Modo Admin'?",
    answer: [
      { type: 'text', text: "Es una vista especial para los administradores que les permite editar y borrar contenido directamente desde la página, como noticias, juegos o Puntos Verdes." }
    ]
  },
  {
    question: "¿Cómo activo el Modo Admin?",
    answer: [
      { type: 'text', text: "Si tu cuenta es de administrador, verás un interruptor en la cabecera de la página para activar o desactivar este modo." }
    ]
  },
  {
    question: "¿Por qué veo botones de editar y borrar por todos lados?",
    answer: [
      { type: 'text', text: "Probablemente tengas el Modo Admin activado. Esos botones solo son visibles para los administradores en ese modo y te permiten gestionar el contenido." }
    ]
  },
  {
    question: "¿Esta página funciona en celulares?",
    answer: [
      { type: 'text', text: "¡Sí! La aplicación está diseñada para ser completamente responsiva y funcionar bien tanto en computadoras de escritorio como en celulares y tablets." }
    ]
  },
  {
    question: "¿Cómo puedo volver a la página de inicio?",
    answer: [
      { type: 'text', text: "Puedes hacer clic en el logo de 'EcoGestión' en la esquina superior izquierda en cualquier momento para volver a la página principal." }
    ]
  },
  {
    question: "¿Quién está detrás de EcoGestión?",
    answer: [
      { type: 'text', text: "Somos un equipo dedicado a promover la cultura del reciclaje y la sostenibilidad en Formosa, trabajando para hacer de nuestra ciudad un lugar más limpio." }
    ]
  },
  {
    question: "¿Cómo puedo contactarlos?",
    answer: [
      { type: 'text', text: "Tenemos una sección de 'Contacto' con un formulario para que nos envíes tus preguntas, sugerencias o propuestas de colaboración." },
      { type: 'link', title: "Ir a Contacto", url: "#contacto" }
    ]
  },
  {
    question: "¿Qué es EcoBot?",
    answer: [
      { type: 'text', text: "¡Soy yo! Soy un asistente de inteligencia artificial diseñado para responder tus preguntas sobre reciclaje y también para ayudarte a navegar y usar esta aplicación." }
    ]
  },
  {
    question: "¿EcoBot puede cometer errores?",
    answer: [
      { type: 'text', text: "Aunque intento ser lo más preciso posible, soy una IA y siempre estoy aprendiendo. Si encuentras una respuesta que crees que es incorrecta, te agradecemos que nos lo hagas saber." }
    ]
  },
  {
    question: "¿Cómo puedo sugerir una mejora para la página?",
    answer: [
      { type: 'text', text: "¡Nos encantan las sugerencias! La mejor manera es usar el formulario en la página de 'Contacto' para enviarnos tu idea." }
    ]
  }
];