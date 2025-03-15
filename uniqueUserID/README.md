# Generador de UserID Único para Node.js

Este módulo genera un identificador (ID) único para cada usuario basado en características específicas del hardware y sistema operativo. El ID generado permanece constante incluso si se elimina el archivo donde se almacena, y solo cambia si se modifica el hardware o el sistema operativo.

## Características principales

- **Identificador persistente**: Genera el mismo ID siempre, incluso si se elimina el archivo donde se almacena.
- **Basado en hardware**: Utiliza características únicas del hardware para generar el ID.
- **Multiplataforma**: Compatible con Windows, Linux y macOS.
- **ES6 puro**: Implementado en JavaScript ES6 sin dependencias de TypeScript.
- **Sin dependencias externas**: Solo utiliza módulos nativos de Node.js.
- **Seguro**: Implementa hashing SHA-256 para la generación del ID.

## Instalación

1. Copie `uniqueUserID` en su proyecto.
2. Importe el módulo en sus archivos JavaScript.

## Uso básico

```javascript
import { getUniqueUserID } from './uniqueUserID/main.mjs';

// Obtener el ID único
getUniqueUserID().then(userID => {
  console.log("ID único del usuario:", userID);
});
```

## API

### Funciones principales

#### `getUniqueUserID()`

Función asíncrona que devuelve el ID único del usuario.

**Retorno:**
- `Promise<string>`: Promesa que resuelve con el ID único del usuario como string.

**Ejemplo:**
```javascript
const userID = await getUniqueUserID();
console.log(userID); // e.g., "8f7d9a6e5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0..."
```

### Clase `UniqueUserIDGenerator`

Clase principal que implementa la lógica de generación de IDs.

#### Constructor

```javascript
const generator = new UniqueUserIDGenerator();
```

#### Métodos

##### `async generateID()`

Genera el ID único del usuario basado en la información del sistema.

**Retorno:**
- `Promise<string>`: Promesa que resuelve con el ID único.

##### `async verifyID()`

Verifica si el ID almacenado es válido.

**Retorno:**
- `Promise<boolean>`: Promesa que resuelve con `true` si el ID es válido, `false` en caso contrario.

##### `async getSystemInfo()`

Recopila información del sistema operativo y hardware.

**Retorno:**
- `Promise<Object>`: Promesa que resuelve con un objeto conteniendo la información del sistema.

##### `getNetworkMACs()`

Obtiene las direcciones MAC de las interfaces de red.

**Retorno:**
- `Array`: Lista ordenada de direcciones MAC.

##### `hashString(str)`

Genera un hash SHA-256 a partir de una cadena.

**Parámetros:**
- `str (string)`: Cadena a hashear.

**Retorno:**
- `string`: Valor hash en formato hexadecimal.

## Detalles técnicos

### Información recopilada

El módulo recopila diferentes tipos de información según el sistema operativo:

#### Común a todos los sistemas
- Plataforma y versión del sistema operativo
- Arquitectura del procesador
- Número de núcleos y modelo de CPU
- Memoria total del sistema
- Nombre del host
- Direcciones MAC de interfaces de red

#### Windows
- Serial del disco duro principal
- Serial de la BIOS
- UUID de la placa base
- ID del procesador

#### Linux
- UUID del sistema (DMI)
- Serial de la placa base
- Información detallada del procesador
- UUID del disco principal

#### macOS
- Hardware UUID
- Número de serie del dispositivo
- Identificador del modelo

### Almacenamiento

El ID generado se almacena en un archivo oculto (`.unique_hw_id`) en el directorio home del usuario con permisos restrictivos (0o600).

## Seguridad

- El ID se genera mediante un hash SHA-256, lo que hace prácticamente imposible revertir el proceso para obtener la información original.
- La información del sistema se maneja localmente y no se envía fuera del dispositivo.
- El archivo de almacenamiento tiene permisos restrictivos para evitar accesos no autorizados.

## Limitaciones

- Modificaciones significativas en el hardware (como cambiar la placa base o CPU) resultarán en un ID diferente.
- Actualizar el sistema operativo podría, en algunos casos, generar un ID diferente.
- Se requieren permisos de administrador para acceder a cierta información del sistema en algunos casos.

## Casos de uso

- Licencias de software vinculadas al hardware
- Identificación de dispositivos para aplicaciones distribuidas
- Sistemas anti-piratería
- Seguimiento de dispositivos sin depender de cookies o almacenamiento web
