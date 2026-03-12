# 🛡️ Sistema de Detección

**Versión**: 2.0
**Cobertura**: Todos los tipos de archivo  
**Ejecución**: 100% local, sin conexiones externas

---

## 📋 Descripción General

Privacy Inspector posee un **módulo avanzado de análisis de seguridad** que detecta múltiples vectores de ataque en archivos de cualquier tipo. El sistema:

- ✅ Analiza **7 tipos de amenazas críticas** por archivo
- ✅ Detecta automáticamente el tipo y aplica análisis específico
- ✅ Reduce el índice de privacidad según amenazas encontradas
- ✅ Muestra alertas visuales de color rojo/naranja/amarillo
- ✅ Bloquea ejecución de cualquier código detectado

---

## 🎯 Tipos de Archivos Analizados

### 🎬 VÍDEOS (MP4, MOV, WebM, MKV)
Detecta **7 amenazas críticas**:

#### 1️⃣ Scripts Incrustados
- **Qué detecta**: `javascript:`, `eval()`, `exec()`, `<script>`, `powershell`, `cmd.exe`
- **Severidad**: 🚨 **CRÍTICO** (9/10)
- **Riesgo**: Ejecución de código arbitrario al reproducir el video

#### 2️⃣ URLs Sospechosas
- **Qué detecta**: Direcciones IP directas, dominios maliciosos (`malware`, `botnet`, `trojan`, `c2`)
- **Severidad**: 🚨 **CRÍTICO** (9.5/10)
- **Riesgo**: Conexión a servidores de control de malware

#### 3️⃣ Payload Binario Oculto
- **Qué detecta**: Boxes MP4 desconocidas (`udta`, metadata no estándar)
- **Severidad**: ⚠️ **ALTO** (8/10)
- **Riesgo**: Archivos ejecutables o exploits embebidos

#### 4️⃣ Múltiples Blobs Base64
- **Qué detecta**: > 1 bloque Base64 > 500 caracteres, o 1 bloque > 10KB
- **Severidad**: ⚠️ **MEDIO-ALTO** (7/10)
- **Riesgo**: Ocultación de datos binarios (shellcode, malware)

#### 5️⃣ Metadata Ofuscada
- **Qué detecta**: Análisis de entropía (> 7.5 indica cifrado)
- **Severidad**: ⚠️ **ADVERTENCIA** (6/10)
- **Riesgo**: Ocultación de información

#### 6️⃣ Cabeceras Manipuladas
- **Qué detecta**: Tamaños inválidos, offsets rotos, tipos corruptos
- **Severidad**: 🚨 **CRÍTICO** (9/10)
- **Riesgo**: Crash del reproductor, explotación de vulnerabilidades

#### 7️⃣ Esteganografía (Stegomalware)
- **Qué detecta**: Padding > 100KB, patrones repetitivos, datos no estándar
- **Severidad**: ⚠️ **MEDIO** (7/10)
- **Riesgo**: Datos maliciosos ocultos en frames o audio

---

### 🖼️ IMÁGENES (JPG, PNG, WebP, GIF)

#### EXIF Injection
- **Qué detecta**: Código ejecutable en campos EXIF (marcador FFE1)
- **Severidad**: 🚨 **CRÍTICO** (9/10)
- **Patrones**: Scripts, eval(), comandos de sistema

#### Archivos Ejecutables Embebidos
- **Qué detecta**: ZIP, PE (.exe), ELF dentro de imagen
- **Severidad**: 🚨 **CRÍTICO** (9.5/10)
- **Riesgo**: Descarga accidental de malware

#### Metadata IPTC Maliciosa
- **Qué detecta**: Palabras clave maliciosas en tags IPTC
- **Severidad**: ⚠️ **ADVERTENCIA** (6/10)
- **Patrones**: `malware`, `virus`, `trojan`, `botnet`, `payload`

---

### 📄 PDF

#### JavaScript en PDF
- **Qué detecta**: `/JS`, `/OpenAction`, `/AA`, `javascript:`, `eval()`
- **Severidad**: 🚨 **CRÍTICO** (9.5/10)
- **Riesgo**: Ejecución de código al abrir el PDF

#### URLs Maliciosas
- **Qué detecta**: Links con palabras clave maliciosas
- **Severidad**: 🚨 **CRÍTICO** (9/10)
- **Patrones**: `malware://`, `phishing://`, etc.

#### Acciones de Lanzamiento
- **Qué detecta**: `/Launch`, `/SubmitForm`, `/ImportData`, `/Flash`
- **Severidad**: ⚠️ **ALTO** (8/10)
- **Riesgo**: Ejecución de aplicaciones externas

#### Estructura Anómala
- **Qué detecta**: > 100 objetos (inusualmente alto)
- **Severidad**: ⚠️ **ADVERTENCIA** (5/10)
- **Riesgo**: Posible corrupción o manipulación

---

### 📊 DOCX / OFFICE (Word, Excel, PowerPoint)

#### Macros VBA
- **Qué detecta**: `word/vbaProject.bin`
- **Severidad**: 🚨 **CRÍTICO** (9.5/10)
- **Riesgo**: Ejecución de código VBA al abrir documento

#### Links Externos Maliciosos
- **Qué detecta**: URLs con patrones maliciosos en `document.xml`
- **Severidad**: ⚠️ **ALTO** (8/10)
- **Riesgo**: Phishing, descarga de malware

#### Múltiples Enlaces Externos
- **Qué detecta**: > 10 enlaces (comportamiento inusual)
- **Severidad**: ⚠️ **ADVERTENCIA** (5/10)
- **Riesgo**: Documento de phishing

#### Objetos Embebidos
- **Qué detecta**: Carpeta `word/embeddings`
- **Severidad**: ⚠️ **ADVERTENCIA** (6/10)
- **Riesgo**: Ejecución de código desde objeto embebido

---

### 📦 ZIP / ARCHIVOS COMPRIMIDOS

#### Archivos Ejecutables
- **Qué detecta**: `.exe`, `.dll`, `.scr`, `.bat`, `.cmd`, `.ps1`, `.vbs`, `.jar`
- **Severidad**: 🚨 **CRÍTICO** (9.5/10)
- **Riesgo**: Descarga de malware

#### Path Traversal
- **Qué detecta**: `../`, `..\\`, rutas absolutas `/`
- **Severidad**: 🚨 **CRÍTICO** (9/10)
- **Riesgo**: Escritura fuera del directorio destino

#### ZIP Bomb
- **Qué detecta**: Ratio de compresión > 100x
- **Severidad**: ⚠️ **ADVERTENCIA** (7/10)
- **Riesgo**: Ataque DoS (denegación de servicio)

#### Archivos Encriptados
- **Qué detecta**: Archivos protegidos con contraseña
- **Severidad**: ⚠️ **ADVERTENCIA** (6/10)
- **Riesgo**: Imposible verificar contenido

---

### 🎵 AUDIO (MP3, WAV, FLAC, AAC)

#### ID3 Tag Injection
- **Qué detecta**: Código ejecutable en tags ID3
- **Severidad**: 🚨 **CRÍTICO** (9/10)
- **Patrones**: Scripts, commands embebidos

#### URLs Sospechosas en Metadata
- **Qué detecta**: URLs con palabras clave maliciosas
- **Severidad**: ⚠️ **ADVERTENCIA** (6/10)
- **Riesgo**: Phishing a través de metadatos

#### Payload Embebido
- **Qué detecta**: ZIP o ejecutables dentro del archivo de audio
- **Severidad**: ⚠️ **ADVERTENCIA** (7/10)
- **Riesgo**: Ocultación de malware

---

## 📊 Matriz de Severidad

| Nivel | Icono | Penalidad | Acción |
|-------|-------|-----------|--------|
| 🚨 **CRÍTICO** | 🚨 | -2.0 puntos | **DETENER** - Archivo potencialmente malicioso |
| ⚠️ **ALTO** | ⚠️ | -1.0 a -1.5 puntos | **ADVERTENCIA** - Comportamiento muy sospechoso |
| ⚠️ **ADVERTENCIA** | ⚠️ | -0.3 a -0.5 puntos | **INFORMACIÓN** - Señal de alerta moderada |

---

## 🔧 Integración Técnica

### Función Principal: `analyzeFileSecurityThreats(file, buffer, fileCategory)`

Detecta automáticamente el tipo de archivo y aplica análisis específico:

```javascript
// Automático según categoría
analyzeFileSecurityThreats(file, buffer, "Vídeo")      → analyzeVideoSecurityThreats()
analyzeFileSecurityThreats(file, buffer, "Imagen")     → analyzeImageSecurityThreats()
analyzeFileSecurityThreats(file, buffer, "PDF")        → analyzePdfSecurityThreats()
analyzeFileSecurityThreats(file, buffer, "Audio")      → analyzeAudioSecurityThreats()
```

### Flujo de Procesamiento

1. **Carga del archivo** → Se obtiene el buffer completo o parcial (max 500MB)
2. **Detección de tipo** → Se determina la categoría automáticamente
3. **Análisis de seguridad** → Se ejecutan 7+ verificaciones paralelas
4. **Generación de alertas** → Se muestran en la UI con colores
5. **Actualización de score** → Cada amenaza reduce el índice de privacidad

---

## 🛡️ Protecciones Implementadas

✅ **No ejecuta código detectado**  
✅ **No descarga URLs maliciosas**  
✅ **Análisis en memoria** (sin escritura a disco)  
✅ **Validación sin decodificación vulnerable**  
✅ **Límites de memoria** (parada en archivos > 500MB)  
✅ **Protección anti-DoS** (análisis máximo 50MB por tipo)  

---

## 📈 Ejemplo de Salida

```
🚨 Alerta de seguridad
Amenazas: 4 (CRÍTICAS)
Advertencias: 2

[Scripts incrustados]          🚨 CRÍTICO
Se detectó patrón: eval()

[URLs sospechosas]            🚨 CRÍTICO
Se encontraron 3 dirección(es) IP incrustada(s): 192.168.1.1, ...

[Cabeceras manipuladas]       🚨 CRÍTICO
5 anomalías estructurales detectadas

[Esteganografía sospechosa]   ⚠️ MEDIO
Se detectó 500KB de padding al final

Riesgo General: 🚨 CRÍTICO
Índice de Privacidad: 2.5/10 (ROJO)
```

---

## 📝 Nota de Seguridad

Este analizador es **defensivo** no **ofensivo**:

- Detecta patrones de ataque conocidos
- No ejecuta ni carga ningún código
- Es imposible ser infectado a través de Privacy Inspector
- Los archivos se procesan solo en memoria del navegador
- No hay transmisión a servidores externos

Para archivos con **amenazas críticas**, se recomienda:
1. ❌ NO descargar
2. ❌ NO abrir
3. ✅ Reportar a antivirus
4. ✅ Informar al proveedor del archivo

---

## 🔄 Historial de Actualizaciones

### v2.0 (12 Marzo 2026)
- Expansión a **todos los tipos de archivo**
- Análisis específico por categoría
- Nuevas funciones: `analyzeImageSecurityThreats()`, `analyzePdfSecurityThreats()`, `analyzeDocxSecurityThreats()`, `analyzeZipSecurityThreats()`, `analyzeAudioSecurityThreats()`
- Documentación completa renovada

### v1.0 (12 Marzo 2026)
- Inicial: Análisis de videos (MP4, WebM, MKV)
- 7 tipos de amenazas para vídeos
- Integración con sistema de scoring de privacidad
