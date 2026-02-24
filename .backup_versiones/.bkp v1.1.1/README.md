# Online EXIF Data Viewer 📷

Un visor de metadatos EXIF moderno, seguro y 100% local. Diseñado con un estilo "glassmorphism" inspirado..

## ✨ Características

Esta página web ofrece un visor de metadatos EXIF completamente local y seguro con las siguientes funcionalidades:

- **Carga de archivos** mediante botón, arrastrar y soltar o pegar desde el portapapeles (Ctrl+V).
- **Procesado 100 % en el navegador**, sin subir nada a servidores.
- **Soporta cualquier tipo de archivo copiado**, ya no restringe el selector `input` con `accept`.
- **Pre‑visualización de la foto** usando URLs de objeto (Blob) para no exponer rutas.
- **Lectura y extracción de todos los metadatos EXIF** disponibles en el archivo.
- **Escapado y sanitización** de valores antes de mostrarlos para prevenir XSS.
- **Marcado de información sensible**, como coordenadas GPS o identificadores de dispositivo.
- **Conversión de coordenadas GPS** a vínculos clicables de mapas.
- **Fallo seguro al cargar la librería EXIF desde CDN**, con un fallback local incluido.
- **Responsive y estilizado con glassmorphism**, adaptándose a móviles y tablets.
- **Soporte offline completo**, funciona sin conexión si la librería está cacheada.
- **Reset del visor** para limpiar datos y liberar memoria.

Además de estas funciones, el proyecto es fácil de desplegar en GitHub Pages y no requiere backend.

## 🛠️ Tecnologías

- HTML5, CSS3 (Variables, Backdrop-filter)
- Vanilla JavaScript (ES6+)
- [ExifReader](https://github.com/mattiasw/ExifReader) (vía CDN jsDelivr con fallback local)

## 🔒 Seguridad

- **Sin Backend:** No hay base de datos ni servidor procesando tus fotos.
- **Sanitización:** Los datos EXIF se escapan antes de mostrarse para prevenir ataques XSS.
- **Blob URLs:** Se utilizan URLs de objetos locales para la previsualización de imágenes, evitando fugas de memoria y exposición de rutas.

## 🆕 Novedades

- Añadido panel de inspección y sección de resultados con estilos responsivos y animaciones.
- Introducción de variables CSS para theming y mejor gestión de colores.
- Ajustes de diseño responsive específicos para pantallas móviles.
- Animaciones en componentes clave (panel de inspección, resultados, etiquetas de puntuación).
- Mejora en la zona de carga con feedback drag‑and‑drop y señales visuales.
- Nuevos estilos para badges de puntuación de privacidad e indicadores de estado.