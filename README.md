# Online EXIF Data Viewer 📷

## ✅ Qué hace?
Privacy Inspector es una herramienta **100 % local** para inspeccionar, analizar y limpiar metadatos de archivos.
Se realiza **en el navegador**; **nada se envía a servidores externos**.

## ✨ Características destacadas

- ✅ **Análisis de metadatos** en profundidad: EXIF, GPS, XMP, IPTC, ICC, PDF, DOCX, ZIP, etc.
- 🔎 **Búsqueda avanzada**: filtros por área (EXIF, GPS, contenido sensible, etc.), severidad, modo de consulta y “solo sensible”.
- 📦 **Procesamiento por lotes**: analiza múltiples archivos en cola y guarda el historial por sesión.
- 🧠 **Modo educativo**: explicaciones rápidas de por qué cada metadato puede ser sensible.
- 🧹 **Perfiles de limpieza**: completos, inteligentes, básicos, conservando autoría o selectivos.
- 🛡️ **Matriz de riesgo**: calificación visual de riesgos (crítico, alto, medio, bajo) con top issues.
- 🔐 **Verificación de integridad**: hashes (SHA‑512 / SHA‑256 / MD5 / CRC32) antes y después.
- 🌐 **Offline + PWA**: funciona sin conexión y tiene caching seguro.
- 🦠 Qué **“virus”** analiza esta aplicación?
    Esta app no es un antivirus ni ejecuta o emula ningún archivo malicioso. Lo que hace es buscar patrones y palabras clave en los metadatos o texto dentro del archivo para marcar posibles “señales de alarma” (heurísticas).

## 🛠️ Tecnologías usadas

- JavaScript moderno (ES2020+)
- [ExifReader](https://github.com/mattiasw/ExifReader)
- `piexif.js` para manipular EXIF
- `pdf.js` para metadatos PDF
- `JSZip` para DOCX y ZIP
- `crypto-js` + Web Crypto API para hashes
- HTML5, CSS3, Service Worker

## 📷 Capturas de ejemplo

Antes de limpiar:

![Original](assets/pt/2026-02-21.png)

Después de limpieza (metadatos borrados):

![Limpia](assets/pt/2026-02-21vCLEAN.png)

## 🔒 Seguridad y privacidad

- ✅ **Procesamiento local** (nunca se sube nada)
- ✅ **CSP reforzada** para impedir inyecciones
- ✅ **Render seguro** sin `innerHTML` con datos no confiables
- ✅ **Detección de inconsistencias** entre extensión, MIME y firma binaria

## 🆕 Novedades recientes

- Análisis por lotes con historial y exportación
- Búsqueda avanzada con filtros y resaltado seguro
- Matriz de riesgo + top issues por archivo
- Perfiles de limpieza (completo, inteligente, básico, selectivo)
- Modo educativo con explicaciones rápidas



- Aún se tienen que mejorar los Falsos Positivos

---

*Ejecuta este proyecto en cualquier navegador moderno y no necesitas instalación.*

