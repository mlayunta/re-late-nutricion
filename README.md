# Re-Late · Nutrición Saludable

PWA de nutrición y seguimiento para pacientes en **rehabilitación cardíaca**.
Funciona **sin conexión**, guarda todos los datos **en el propio dispositivo** y no envía nada a ningún servidor.

- **Autor:** Miguel Ángel Layunta López
- **Versión:** PWA 2.0
- **Estado:** prototipo **pendiente de validación clínica**. No es un producto sanitario.
- **Ecosistema:** TRAZA//CO2

> ⚠️ **Aviso:** aplicación de carácter educativo e informativo. No sustituye las prescripciones del médico especialista, endocrinólogo o nutricionista. Los valores nutricionales son orientativos y deben contrastarse con tablas oficiales (BEDCA, USDA) para uso clínico estricto.

---

## Contenido del repositorio

| Archivo | Descripción |
|---|---|
| `index.html` | Aplicación completa (HTML + CSS + JS en un único archivo) |
| `manifesto.json` | Manifiesto de la PWA (nombre, iconos, colores, modo standalone) |
| `sw.js` | Service Worker: precachea el shell y permite el uso sin conexión |
| `pwa-192.png` | Icono 192×192 |
| `pwa-512.png` | Icono 512×512 |
| `README.md` | Este documento |

> **Nota:** el manifiesto se llama `manifesto.json` (no `manifest.json`) y así está referenciado en el `<link rel="manifest">` del `index.html`. Si se renombra, hay que actualizar esa línea.

---

## Funcionalidades

### 🥦 Alimentos (70)
Buscador y filtro por categorías. Cada alimento muestra su **semáforo nutricional** y las kcal por 100 g (o por 100 ml en bebidas).

### 🍽️ Comidas
Registro diario en 4 bloques (Desayuno, Media mañana, Comida, Cena). Totales de energía, proteínas, hidratos y grasas, y barra de progreso frente al **objetivo energético diario** (por defecto 2000 kcal, ajustable entre 800 y 5000).

### 🥗 Platos preparados (65)
Opciones rápidas con valores **por ración**.

### 📖 Recetario (32)
Recetas mediterráneas con ingredientes, elaboración e índice nutricional por ración. Incluye enlaces a recetarios externos (SEC/Fundación Española del Corazón, Mayo Clinic, Nutrition.gov, Fundación Dieta Mediterránea).

### 📊 Control
- **Cardio:** tensión arterial, pulso y peso, con clasificación automática y gráfico de evolución.
- **Nutrición detallada:** sodio, grasas saturadas/mono/poli/trans, potasio, vitamina K, azúcares añadidos y carga glucémica, con indicación de **cobertura de datos**.
- **Glucosa:** registro manual e importación de CSV/JSON (mg/dL o mmol/L).
- **Eventos:** insulina, medicación oral, actividad física, hipoglucemias e hiperglucemias.
- **Hidratación:** registro de líquidos.
- **Pauta profesional:** límites de sodio, líquidos, potasio y vitamina K, y filtros de recetas.
- **Informes:** informe imprimible/PDF y copia de seguridad JSON.

---

## Criterios de cálculo (resumen)

- **kcal y macros por ración:** valor de tabla × factor de porción.
  - `ración` → factor = nº de raciones
  - `ud` → factor = unidades × (gramos por unidad / 100)
  - `g` / `ml` → factor = cantidad / 100
- **Semáforo nutricional:** campo **editorial fijo** asignado a cada alimento (no se calcula con umbrales automáticos).
- **Carga glucémica:** `IG × hidratos disponibles de la porción / 100`.
- **Clasificación de tensión:** cascada OR conforme a ESC/OMS.
- **Glucosa:** conversión `mmol/L × 18,0182 = mg/dL`.
- **Adherencia:** tomas registradas / (registradas + omitidas).

---

## Privacidad

- Todos los datos se guardan en `localStorage` del dispositivo. **No hay backend ni analítica.**
- **Sin cifrado propio:** quien acceda al dispositivo o al origen puede leerlos.
- Los CSV, JSON y PDF exportados contienen información sanitaria sensible.
- **No certificado RGPD/HIPAA.** Antes de un uso asistencial se requiere evaluación de finalidad, base jurídica, responsabilidades, seguridad, conservación y derechos.

---

## Limitaciones conocidas

1. Los valores nutricionales del catálogo **no están verificados clínicamente**.
2. El semáforo es una clasificación editorial y su base no es homogénea (100 g en alimentos, por ración en platos preparados).
3. La carga glucémica y las correlaciones **no predicen** la respuesta glucémica individual.
4. La app **no calcula dosis** de insulina ni ajusta fármacos.
5. El filtro de ingredientes usa coincidencias de texto: no reconoce sinónimos ni garantiza ausencia de alérgenos.

---

## Publicación (GitHub Pages)

1. Sube `index.html`, `manifesto.json`, `sw.js`, `pwa-192.png` y `pwa-512.png` a la raíz del repositorio.
2. Activa GitHub Pages sobre la rama `main` (carpeta `/root`).
3. Abre la URL publicada y comprueba en DevTools → *Application* que el **Service Worker** aparece como *activated* y que el manifiesto se lee sin errores.

---

## Registro de cambios

### v2.0
- Añadida la pestaña **Control** (cardio, nutrición detallada, glucosa, eventos, hidrólisis, pauta e informes).
- Registro histórico por días con conservación de datos anteriores.
- Importación de glucosa por CSV/JSON y exportación de copia de seguridad.
- Corrección del registro del Service Worker (`sw.js`).
- Corrección del guardado del objetivo energético.
- Corrección de la clasificación de tensión arterial y de los factores de porción.
- Reubicación del contenedor de avisos dentro de `<body>`.
