# Online EXIF Data Viewer 📷

Metadatos EXIF moderno, seguro y 100% local.

## ✨ Características

Este visor es 100 % local y ofrece un conjunto muy completo de herramientas para inspeccionar y sanitizar metadatos. Todas las acciones se ejecutan en el navegador, **nunca se sube nada**.

- **Carga flexible**: botón, arrastrar‑soltar, pegar (Ctrl+V) o arrastrar desde otra ventana.
- **Vista previa segura**: imágenes mostradas usando Blob URLs, sin exponer rutas reales.
- **Extracción exhaustiva**: lee EXIF, GPS, MakerNotes, IPTC, XMP, ICC, PDF y DOCX.
- **Búsqueda en metadatos** con resaltado de coincidencias.
- **Limpieza selectiva o completa** mediante checkboxes; elimina sólo lo que elija el usuario.
- **Panel de diffs visuales** que muestra qué campos han sido borrados.
- **Sistema de undo/redo** para retroceder o rehacer limpiezas en cualquier momento.
- **Hashing de integridad**: SHA‑512, SHA‑256, MD5 y CRC32 tanto antes como después.
- **Scoring de privacidad** con detección avanzada (URLs, IMEI, SSN, tarjetas, direcciones cripto, etc.) y penalizaciones ponderadas.
- **Soporte de documentos**: extrae metadatos de PDF y DOCX automáticamente.
- **Compatibilidad móvil** y diseño responsivo con animaciones ligeras.
- **Offline y sin servidor**: todo el código corre en el cliente; se puede servir desde GitHub Pages.

## 🛠️ Tecnologías

- HTML5, CSS3 (Variables, Flex/Grid, Backdrop-filter)
- Vanilla JavaScript moderno (ES6+) y ES modules
- [ExifReader](https://github.com/mattiasw/ExifReader) + `piexif.js` para manipular
- `pdf.js` para metadatos PDF y `JSZip` para DOCX
- `crypto-js` para MD5 y Web Crypto API para SHA/CRC32
- Sin dependencias de servidor; desplegable en GitHub Pages u otro CDN estático.

## 📷 Capturas de ejemplo

Antes de limpiar:

![Original](assets/pt/2026-02-21.png)

Después de limpieza (metadatos borrados):

![Limpia](assets/pt/2026-02-21vCLEAN.png)

## 🔒 Seguridad

El diseño prioriza la privacidad y seguridad:

- **Procesado local al 100 %**: no existe backend ni envío de datos.
- **Sanitización exhaustiva** de todos los valores antes de renderizar.
- **Hashes de integridad** permiten comprobar que el archivo no ha sido manipulado.
- **Modelo de permisos cero**: excepto el acceso al archivo seleccionado, la app no pide nada más.

## 🆕 Novedades

Las últimas actualizaciones han convertido a la aplicación en una *herramienta profesional* de análisis de privacidad, y se han aplicado mejoras profundas en el motor de detección para reducir falsos positivos y aumentar la fiabilidad:

- 🔍 **Búsqueda multifuncional** en todo el árbol de metadatos con resaltado.
- ✅ **Selección checkbox** para eliminar campos individuales y ver resultados con diffs visuales.
- 🔄 **Deshacer/Rehacer** cambios a cualquier paso gracias al historial de estados.
- 🔐 **Hashes múltiples** (SHA‑512, SHA‑256, MD5, CRC32) para verificar integridad de archivos.
- 📄 **Soporte agregado para PDF y DOCX** con extracción de metadatos y análisis de sensibilidad.
- 🧠 **Detección avanzada** de datos sensibles (IMEI, SSN, tarjetas, coordenadas, direcciones cripto...) con puntaje de privacidad optimizado.
- 📉 Estadísticas de ahorro de tamaño tras limpieza y comparadores antes/después.
- 🎨 Mejoras generales de UI/UX, incluyendo panel de diffs y carga mejorada.
