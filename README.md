# 🫀 Re-Late Nutrición Saludable

Aplicación web progresiva (PWA) de nutrición saludable y seguimiento para pacientes en **rehabilitación cardíaca**. Funciona sin conexión una vez instalada y **todos los datos se guardan únicamente en el dispositivo** (localStorage): no se envía información a ningún servidor.

> ⚠️ **Aviso:** prototipo no validado clínicamente. No sustituye las prescripciones de su médico, endocrinólogo ni nutricionista, no calcula dosis de insulina y no certifica cumplimiento RGPD/HIPAA.

**Autor:** Miguel Ángel Layunta López · © 2026 · Versión PWA 2.0

---

## 📑 Pestañas de la aplicación

| # | Pestaña | Contenido |
|---|---------|-----------|
| 1 | **🫀 Info** | Presentación de la app, aviso de uso y guía de instalación (Android/iPhone). Es la pantalla con la que arranca la aplicación. |
| 2 | **🍽️ Comidas** | Registro del día (desayuno, media mañana, comida y cena), resumen nutricional, objetivo calórico, platos preparados y vaciado diario. |
| 3 | **🥦 Alimentos** | Buscador y catálogo de alimentos con semáforo nutricional (recomendado / moderado / ocasional). |
| 4 | **📖 Recetas** | Recetario cardiosaludable con **recetas ordenadas alfabéticamente** (en «Todas» y por categoría), recursos externos de Dieta Mediterránea y principios de la dieta cardioprotectora. |
| 5 | **📊 Control** | Seguimiento completo: **registro cardiovascular (tensión, pulso y peso) con gráfica de evolución e historial exportable en CSV**, nutrición detallada (sodio, CG, grasas, potasio, vitamina K), glucosa e importación MCG, eventos y adherencia, hidratación, pauta profesional con filtros e informes imprimibles. |

> La antigua pestaña **«Salud»** se ha integrado dentro de **Control**; ya no existe como pestaña independiente.

---

## 🚀 Cómo usar

1. Abre la URL publicada (GitHub Pages) en el navegador del móvil.
2. **Android/Chrome:** menú ⋮ → «Instalar aplicación», o el botón **⬇️ Instalar** de la cabecera.
   **iPhone/Safari:** botón Compartir → «Añadir a pantalla de inicio».
3. Tras la primera apertura con conexión, la app funciona **offline**.

## 📂 Archivos del proyecto

| Archivo | Descripción |
|---------|-------------|
| `index.html` | Aplicación completa (HTML + CSS + JS en un único archivo). |
| `manifesto.json` | Manifiesto PWA (nombre, iconos, colores, modo standalone). |
| `service-worker.js` | Caché de la shell de la app para uso offline. Versión de caché actual: **`relate-shell-…-2.1.0`**. |
| `pwa-192.png` / `pwa-512.png` | Iconos de la aplicación. |
| `README.md` | Este documento. |

## 🔄 Actualizaciones

Al modificar `index.html`, sube también una nueva versión del caché en `service-worker.js` (p. ej. `2.1.0` → `2.1.1`). Los usuarios instalados verán el botón **«Actualizar aplicación (guardar y recargar)»** en la pestaña Control.

## 🔐 Privacidad y datos

- Glucosa, eventos, líquidos, mediciones y comidas se guardan en local **sin cifrado propio**.
- Botones de exportación: CSV (mediciones) y JSON (copia de seguridad completa).
- La opción **«Borrar todos los datos Re-Late»** elimina el localStorage y las cachés de la PWA.
- Los datos exportados son información sanitaria sensible: compártelos solo con destinatarios autorizados.

## 🛠️ Notas técnicas

- Sin dependencias ni build: un solo `index.html` con dos bloques `<script>` (base + módulo de ampliación).
- El catálogo de recetas (`RECIPE_DB`) y sus valores nutricionales están **pendientes de verificación profesional**; la app lo indica en cada ficha.
- HealthKit / Health Connect **no están conectados**: la importación de glucosa es local (CSV/JSON).