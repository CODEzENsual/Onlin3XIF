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

- Se añadieron estilos iniciales en CSS incluyendo temas claro y oscuro.
- Variables CSS definidas para colores, fondos y transiciones.
- Diseño responsive para componentes como botones, zonas de carga y visualización de datos.
- Animaciones para elementos como fondos en gradiente e indicadores de estado.
- Estilos para diferentes estados (hover, activo) y ajustes en móviles.

## 🎵 Reproductor de Audio Personalizado

Se ha integrado un **mini reproductor de audio** flotante en la esquina inferior izquierda:

### Características
- **Autoplay automático** muted al cargar la página (compatible con políticas de navegadores modernos).
- **Interactive unmute:** Al hacer clic en el botón ▶, se activa el sonido y comienza la reproducción.
- **Barra de progreso visual** que actualiza en tiempo real.
- **Tiempo transcurrido** en formato MM:SS.
- **Pausa automática** cuando la pestaña no está visible (ahoro de batería en móviles).
- **Soporte múltiples formatos:** MP3 y OGG (fallback).
- **Fully responsive:** Se adapta a pantallas pequeñas.
- **Sin controles nativos:** Diseño personalizado y controlable.

### Cómo usar (Ya no se puede...)

1. **Agregar archivo de audio:**
   - Coloca tu archivo MP3 y/o OGG en la carpeta `/audio/background/`
   - Nombre recomendado: `tema.mp3` y `tema.ogg`

2. **Estructura de carpetas:**
   ```
   /audio/
   └── /background/
       ├── tema.mp3      (Obligatorio)
       └── tema.ogg      (Opcional, fallback)
   ```

3. **Editar rutas (si es necesario):**
   - Abre `index.html` y busca la sección `<audio id="bgm">`
   - Cambia las rutas en `<source>` según donde coloqués tus archivos

### Notas técnicas
- El reproductor usa `preload="auto"` para cargar el audio en background.
- Atributo `playsinline` para compatibilidad iOS.
- Loop automático cuando termina la reproducción.
- Script autoisolado (IIFE) sin contaminar el scope global.
- Compatible con: Chrome, Firefox, Safari, Edge y navegadores móviles.