# Cositas de Cerámica

La página de la tía Norma. No hay panel: **la tía ve la misma página que sus clientes**, con botones grandes de más.

## Rutas

| Ruta | Para quién | Qué es |
|---|---|---|
| `/` | Clientes | Grilla estática: foto, título y precio. Se regenera sola cuando la tía cambia algo. |
| `/entrar?llave=TOKEN` | La tía (una sola vez) | Deja una cookie por un año y la manda a `/tia`. |
| `/tia` | La tía | La misma página, con Agregar, "Ya la vendí" (con deshacer), cambiar nombre, precio o foto. |
| `/historial` | El sobrino | Qué cambió la tía y cuándo. |
| `/demo` | goncy / cualquiera | Tienda de prueba en modo tía, sin llave. Se reinicia sola cada 60 min. |
| `/demo/publica` | goncy / cualquiera | La tienda de prueba vista como cliente. |

## Deploy en Vercel

1. Subí el repo a GitHub e importalo en Vercel.
2. **Storage → Create → Blob** y conectalo al proyecto. Sirve tanto el sistema nuevo (`BLOB_STORE_ID`, con OIDC) como el viejo (`BLOB_READ_WRITE_TOKEN`), y tanto stores públicos como privados: el código detecta el tipo solo. Si querés forzarlo, definí `BLOB_ACCESS=public` o `private`.
3. En **Environment Variables** agregá `TIA_TOKEN` con algo largo: `openssl rand -hex 24`.
4. Redeploy.

## El celular de la tía

1. Abrí `https://TU-DOMINIO/entrar?llave=TU_TIA_TOKEN` en su celu (te deja en `/tia`).
2. Compartir → **Agregar a pantalla de inicio**. Ese ícono es su "app".

Si alguien consigue la llave, se cambia `TIA_TOKEN` en Vercel y se repite el paso 1.

## Local

```bash
npm install
npm run dev
```

Sin Blob configurado, todo se guarda en `.data/`. La llave local es `norma-local`:
http://localhost:3000/entrar?llave=norma-local

## Decisiones

- **Sin base de datos:** un `piezas.json` en Blob alcanza para una persona y unas decenas de piezas.
- **Sin borrar:** "Ya la vendí" oculta la pieza, con 10 segundos para deshacer y una lista de vendidas para volver a publicarla.
- **Fotos achicadas en el celular** antes de subirlas (de ~5 MB a ~200 KB).
- **Precio a prueba de despistes:** muestra cómo se va a ver ("$ 15.000") y pregunta si pone algo menor a $1.000.
- **Tipografía Atkinson Hyperlegible**, diseñada para gente con baja visión. Base de 20 px, bordes negros, texto negro sobre pasteles.
- **Modo tía con fondo de mesa de taller**, para que sepa en qué modo está sin leer nada.
