# Contexto para Claude Code

Entrega para el challenge de @goncy: "la página de la tía Norma". Cierre: martes 17/11/2026 a las 19:00 (hora argentina).

## El enunciado, resumido
- Norma tiene 70 años, vende piezas de cerámica, ve poco, no tiene compu ni mail y solo usa WhatsApp.
- Boceto: una página con una grilla; cada pieza tiene una imagen, un título y un precio. Sin carrito ni link a WhatsApp.
- Tiene que poder agregar, sacar y cambiar foto o precio de una pieza de forma muy simple.
- Los compradores también son mayores: muy fácil de usar y de leer.
- goncy evalúa el resultado, no el código: que funcione todo, buena performance, cero bugs ni detalles. Pide originalidad y simpleza ("sean vagos, no hagan lo que puedan no hacer").
- Todo tiene que poder probarse: a goncy se le manda por DM el link `/entrar?llave=...`. No hay demo aparte.

## Decisión central
No hay panel de administración: la tía ve **la misma página que los clientes**, con botones grandes de más. Se descartó a propósito un bot de WhatsApp, porque otros participantes ya lo hicieron.

## Stack
- Next.js 16 (App Router, server actions) en Vercel. TypeScript, CSS plano (`app/globals.css`), sin Tailwind.
- Datos: un único `{tienda}/piezas.json` en Vercel Blob (`lib/storage.ts`). Sin `BLOB_READ_WRITE_TOKEN` usa `.data/` local.
- Una sola tienda (`real`). Arranca con dos piezas iniciales (Cocinita y Niña jardinera, en `public/piezas/`).
- Botón «💬 Escribile» en cada pieza: abre WhatsApp si hay `NEXT_PUBLIC_WHATSAPP_NUMERO`; si no, `/whatsapp`, que simula el chat.
- `/` es estática (`force-static`) y se revalida con `revalidatePath` en cada acción.
- Acceso de la tía: `/entrar?llave=TIA_TOKEN` deja una cookie por un año → `/tia`. En local la llave es `norma-local`.

## Archivos clave
- `app/acciones.ts`: todas las mutaciones (agregar, editar, cambiar foto, vendida/deshacer). Los mensajes de error van pensados para la tía (clase `Aviso`).
- `components/Editor.tsx`: modo tía (cliente). Comprime fotos en el navegador, avisos grandes, "deshacer" de 10 s, alerta de precio menor a $1.000.
- `components/Vitrina.tsx` y `components/Tarjeta.tsx`: grilla pública; la tarjeta se comparte con el modo tía.
- `lib/tienda.ts`: lectura/escritura de datos e historial.

## Diseño
Neobrutalismo con una sola paleta: marrón oscuro `#3a2318` (texto, bordes, sombras), marrón tierra `#8a5136` (botón principal), rosa `#f6d3d0` / `#eeb4ae`, blanco. Tipografía Atkinson Hyperlegible, base de 20 px, una columna en mobile. Todo el texto de la interfaz va en español rioplatense (voseo).

## Pendiente
- Deploy en Vercel (Blob + `TIA_TOKEN`) y probar con fotos reales.
- Grabar video corto y escribir el hilo de entrega.
