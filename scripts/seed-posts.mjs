/**
 * Crea los 3 posts iniciales del blog de RUNAJERABJJ en Cosmos DB.
 * Uso: node scripts/seed-posts.mjs
 */

import { CosmosClient } from "@azure/cosmos";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  try {
    const lines = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8").split("\n");
    for (const line of lines) {
      const [key, ...rest] = line.split("=");
      if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
    }
  } catch { console.log("⚠️  Usando variables del sistema"); }
}

loadEnv();

const BASE = "https://bjjacademymedia.blob.core.windows.net/media";
const IMG  = {
  reglamPuntos: `${BASE}/5a7d35bd-2576-4a0c-82ef-d3eb02615f6e.jpg`,
  reglamPortada:`${BASE}/aa239ab0-8ca3-4aba-b18e-50d5197d98ec.jpg`,
  areaTatami:   `${BASE}/049f267a-358f-4aca-a860-9f0d5c0fcf8c.jpg`,
  tresPuntos:   `${BASE}/71d3aff0-5d6e-4aea-8bf6-9b7f3715e084.jpg`,
  liaVega:      `${BASE}/6fe64dea-0468-4f94-9c75-ab7360d46569.jpg`,
  sarahPaz:     `${BASE}/10691df2-61fb-41d1-925e-622c811fb399.jpg`,
  kidsLucha:    `${BASE}/a0e38c30-b4f4-40b3-97e0-1a3eedc5a67a.jpg`,
  kidsArbitro:  `${BASE}/d7d911b7-1bff-4610-ba63-15522521e1b4.jpg`,
  kidsSaludo:   `${BASE}/fbde3671-a662-4011-b1c8-ff0005cf75a8.jpg`,
  equipoFem:    `${BASE}/e44774ed-62bc-4287-9ba9-90c19be55a81.jpg`,
  grupoClase:   `${BASE}/ad6bd6e5-2793-4e8c-bd5a-34c1740240b7.jpg`,
};

const posts = [
  {
    id:               "post-reglamento-bjj",
    slug:             "reglamento-bjj-puntos-area-combate",
    titulo:           "Reglamento BJJ: Puntos y Área de Combate",
    resumen:          "¿Primera vez compitiendo? Te explicamos de forma simple cómo se puntúa un combate de BJJ y las reglas básicas del área de competencia.",
    categoria:        "consejos",
    autor:            "Carlos Alberto Donado",
    imagen:           IMG.reglamPuntos,
    publicado:        true,
    fechaPublicacion: "2026-05-20",
    tags:             ["reglamento", "puntos", "competencia", "principiantes"],
    contenido: `
<p>Si estás pensando en tu primera competencia, entender el reglamento es clave para llegar tranquilo al tatami. Aquí te explicamos lo más importante de forma directa.</p>

<img src="${IMG.reglamPortada}" alt="Reglamento RUNAJERABJJ" />

<h2>Área de combate</h2>
<p>El área de lucha es de <strong>6 x 6 metros</strong>. Si durante el combate los dos atletas llegan al borde del área, el árbitro central detiene la lucha y los regresa al centro, respetando exactamente la misma posición en la que se encontraban.</p>

<img src="${IMG.areaTatami}" alt="Área de Tatami — reglas" />

<h2>¿Cómo se gana un combate?</h2>
<p>Hay dos formas de ganar:</p>
<ul>
  <li><strong>Submission (rendición)</strong>: el rival toca el tatami, toca al oponente, o dice "tap". El combate termina en ese instante.</li>
  <li><strong>Por puntos</strong>: al terminar el tiempo, gana quien tenga más puntos acumulados.</li>
</ul>

<h2>Sistema de puntos</h2>
<ul>
  <li><strong>2 puntos</strong>: derribo (takedown), sweep desde guard, knee on belly.</li>
  <li><strong>3 puntos</strong>: pasada de guardia.</li>
  <li><strong>4 puntos</strong>: montada completa (mount), back control.</li>
</ul>

<img src="${IMG.tresPuntos}" alt="3 puntos — Pasada de guardia" />

<h2>Ventajas</h2>
<p>Si al finalizar el tiempo el marcador está empatado, gana quien tenga más ventajas. Las ventajas son posiciones de control que casi sumaron puntos pero no llegaron a completarse. Si siguen empatados, decide el árbitro central.</p>

<h2>Consejo final</h2>
<p>No te obsesiones con el marcador durante el combate. Aplica tu juego, busca el submission y los puntos vendrán solos. La experiencia de competir es lo que más te va a enseñar.</p>
    `.trim(),
    creadoEn: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id:               "post-kids-competencia",
    slug:             "nuestros-kids-en-competencia",
    titulo:           "Nuestros Kids en Competencia",
    resumen:          "Nuestros pequeños guerreros del tatami demostraron coraje, técnica y actitud en su más reciente competencia. ¡Orgullosos de todos ellos!",
    categoria:        "noticias",
    autor:            "Carlos Alberto Donado",
    imagen:           IMG.liaVega,
    publicado:        true,
    fechaPublicacion: "2026-05-15",
    tags:             ["kids", "competencia", "torneo", "noticias"],
    contenido: `
<p>El pasado fin de semana, varios de nuestros alumnos de la categoría kids representaron a <strong>RUNAJERABJJ</strong> en competencia. Fue una experiencia increíble verlos aplicar todo lo que han trabajado en el tatami.</p>

<img src="${IMG.sarahPaz}" alt="Sarah Paz en competencia" />

<p>Lia Vega y Sarah Paz fueron dos de las destacadas del día, mostrando técnica, carácter y mucha garra en cada combate. Verlas enfrentarse con respeto y con ganas es exactamente lo que buscamos en la academia.</p>

<img src="${IMG.liaVega}" alt="Lia Vega de RUNAJERABJJ en acción" />

<h2>Más que ganar o perder</h2>
<p>Competir no se trata solo de ganar. Se trata de conocerse uno mismo bajo presión, aprender a manejar los nervios y crecer como persona. Cada uno de nuestros kids lo demostró con creces ese día.</p>

<img src="${IMG.kidsLucha}" alt="Combate de kids en tatami" />

<p>La concentración, el respeto al oponente y la actitud antes y después de cada combate dicen mucho del trabajo que se hace dentro del tatami. Estamos muy orgullosos de todos.</p>

<img src="${IMG.kidsArbitro}" alt="Árbitro con atleta joven" />

<img src="${IMG.kidsSaludo}" alt="Saludo de respeto al final del combate" />

<h2>¡La próxima competencia se acerca!</h2>
<p>Si tu hijo o hija entrena con nosotros y quiere competir, habla con el instructor. Preparamos a cada atleta de forma personalizada para que llegue seguro y confiado al tatami. ¡Los esperamos!</p>
    `.trim(),
    creadoEn: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id:               "post-equipo-femenino",
    slug:             "equipo-femenino-runajerabjj",
    titulo:           "El Equipo Femenino de RUNAJERABJJ",
    resumen:          "En RUNAJERABJJ las mujeres también entrenan fuerte. Conoce a nuestro equipo y por qué el BJJ es el arte marcial más recomendado para mujeres.",
    categoria:        "noticias",
    autor:            "Carlos Alberto Donado",
    imagen:           IMG.equipoFem,
    publicado:        true,
    fechaPublicacion: "2026-05-10",
    tags:             ["mujeres", "equipo", "defensa personal", "bjj"],
    contenido: `
<p>Una de las cosas que más nos enorgullece en <strong>RUNAJERABJJ</strong> es la participación femenina. Nuestro equipo de mujeres entrena con la misma intensidad y dedicación que cualquier otro atleta, y los resultados hablan por sí solos.</p>

<img src="${IMG.equipoFem}" alt="Equipo femenino de RUNAJERABJJ" />

<h2>¿Por qué BJJ para mujeres?</h2>
<p>El Jiu-Jitsu Brasileño es considerado uno de los mejores artes marciales para la defensa personal femenina, y aquí te explicamos por qué:</p>

<ul>
  <li><strong>Técnica sobre fuerza</strong>: el BJJ fue diseñado para que una persona más pequeña pueda controlar a una más grande. La palanca y la técnica mandan, no la fuerza bruta.</li>
  <li><strong>Comunidad de respeto</strong>: el tatami es un espacio de compañerismo donde todos se cuidan mutuamente.</li>
  <li><strong>Confianza real</strong>: después de unas semanas de entrenamiento, la confianza en ti misma cambia completamente.</li>
  <li><strong>Estado físico completo</strong>: flexibilidad, fuerza funcional, resistencia cardiovascular y coordinación, todo en un mismo entrenamiento.</li>
</ul>

<img src="${IMG.grupoClase}" alt="Clase grupal RUNAJERABJJ" />

<h2>Un ambiente para crecer</h2>
<p>En RUNAJERABJJ contamos con un ambiente seguro y respetuoso donde cada persona puede desarrollarse a su propio ritmo. No importa si nunca has practicado ningún deporte de contacto — aquí empezamos desde cero contigo.</p>

<p>Si sos mujer y estás pensando en empezar a entrenar, esta es tu señal. Solicita tu <strong>clase gratis</strong> y ven a conocernos. ¡Te esperamos en el tatami!</p>
    `.trim(),
    creadoEn: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

async function main() {
  const client   = new CosmosClient({ endpoint: process.env.COSMOS_DB_ENDPOINT, key: process.env.COSMOS_DB_KEY });
  const database = client.database(process.env.COSMOS_DB_DATABASE ?? "bjj-academy");
  const { container } = await database.containers.createIfNotExists({
    id: "posts",
    partitionKey: { paths: ["/id"] },
  });

  console.log("📝 Creando posts del blog...\n");
  for (const post of posts) {
    await container.items.upsert(post);
    console.log(`✅ "${post.titulo}"`);
  }
  console.log("\n🎉 3 posts creados en Cosmos DB.");
}

main().catch(console.error);
