# Documentación de la Clase GenerateID

## Descripción General

`GenerateID` es una clase JavaScript diseñada para generar identificadores únicos de manera robusta y configurable. Esta utilidad está optimizada para crear IDs con alta entropía, minimizando las posibilidades de colisiones o duplicados en aplicaciones que manejan grandes volúmenes de datos.

## Instalación

importa el archivo en tu proyecto:

```javascript
import GenerateID from './path/generate-id/generateID.mjs';
```

## API de Referencia

### Constructor

```javascript
new GenerateID(options)
```

#### Parámetros

| Parámetro | Tipo | Descripción | Valor predeterminado |
|-----------|------|-------------|----------------------|
| `options` | Object | Opciones de configuración para la instancia | `{}` |
| `options.maxLength` | Number | Longitud máxima de los IDs generados | `8` |

La clase mantiene un valor mínimo interno (`minLength`) de 4 caracteres para garantizar identificadores con suficiente entropía.

### Métodos

#### `generate(options)`

Genera un ID único y aleatorio basado en las opciones proporcionadas.

```javascript
const id = generator.generate({
  includeTimestamp: true,
  includeSpecialChars: false,
  useUppercase: true
});
```

##### Parámetros

| Parámetro | Tipo | Descripción | Valor predeterminado |
|-----------|------|-------------|----------------------|
| `options` | Object | Opciones para personalizar la generación | `{}` |
| `options.includeTimestamp` | Boolean | Incluir componente de timestamp para mayor unicidad | `true` |
| `options.includeSpecialChars` | Boolean | Incluir caracteres especiales (`_-.$#@!%&`) | `false` |
| `options.useUppercase` | Boolean | Incluir letras mayúsculas | `true` |

##### Retorno

`String`: Un identificador único generado según las especificaciones.

#### `exists(id, collection, idField)`

Verifica si un ID ya existe en una colección dada.

```javascript
const existe = generator.exists('abc123', usuarios, 'userId');
```

##### Parámetros

| Parámetro | Tipo | Descripción | Valor predeterminado |
|-----------|------|-------------|----------------------|
| `id` | String | ID a verificar | - |
| `collection` | Array\|Object | Colección donde verificar duplicados | - |
| `idField` | String | Nombre del campo ID en objetos de la colección | `'id'` |

##### Retorno

`Boolean`: `true` si el ID existe en la colección, `false` en caso contrario.

#### `generateUnique(collection, options, idField)`

Genera un ID único garantizado verificando contra una colección existente.

```javascript
const nuevoId = generator.generateUnique(usuariosExistentes, {
  includeSpecialChars: true
}, 'userId');
```

##### Parámetros

| Parámetro | Tipo | Descripción | Valor predeterminado |
|-----------|------|-------------|----------------------|
| `collection` | Array\|Object | Colección donde verificar duplicados | - |
| `options` | Object | Opciones para la generación (mismas que `generate()`) | `{}` |
| `idField` | String | Nombre del campo ID en objetos de la colección | `'id'` |

##### Retorno

`String`: Un identificador único garantizado que no existe en la colección proporcionada.

## Ejemplos de Uso

### Uso Básico

```javascript
// Importar la clase
import GenerateID from './GenerateID';

// Crear una instancia con configuración predeterminada
const generator = new GenerateID();

// Generar un ID simple
const id = generator.generate();
console.log('ID generado:', id);
```

### Configuración Personalizada

```javascript
// Crear generador con longitud máxima personalizada
const customGenerator = new GenerateID({ maxLength: 12 });

// Generar ID con caracteres especiales y mayúsculas
const complexId = customGenerator.generate({
  includeSpecialChars: true,
  useUppercase: true,
  includeTimestamp: true
});

console.log('ID complejo:', complexId);
```

### Evitar Duplicados

```javascript
// Base de datos ficticia de usuarios
const usuarios = [
  { id: 'abc123', nombre: 'Juan' },
  { id: 'xyz789', nombre: 'María' }
];

// Generar ID garantizado como único
const idUnico = generator.generateUnique(usuarios);
console.log('ID único:', idUnico);

// Crear nuevo usuario con ID único
usuarios.push({ id: idUnico, nombre: 'Pedro' });
```

### Trabajando con Campos ID Personalizados

```javascript
// Colección con identificador personalizado
const productos = [
  { codigo: 'PRD-001', nombre: 'Monitor' },
  { codigo: 'PRD-002', nombre: 'Teclado' }
];

// Verificar si un código ya existe
const existeCodigo = generator.exists('PRD-001', productos, 'codigo');
console.log('¿El código existe?', existeCodigo); // true

// Generar código único para nuevo producto
const nuevoCodigo = generator.generateUnique(productos, {
  useUppercase: true,
  includeSpecialChars: false
}, 'codigo');

console.log('Nuevo código de producto:', nuevoCodigo);
```

## Características Avanzadas

### Entropía Mejorada

La clase utiliza múltiples fuentes de entropía para garantizar la unicidad:

1. Generación pseudoaleatoria con `Math.random()`
2. Componentes de timestamp con codificación base-36
3. API Web Crypto cuando está disponible en el entorno

### Prevención de Bucles Infinitos

El método `generateUnique()` implementa un límite de intentos (100 por defecto) para evitar bucles infinitos en colecciones muy grandes. Si no se puede generar un ID único después de alcanzar este límite, la clase incrementa automáticamente la longitud máxima para aumentar el espacio de nombres.

### Compatibilidad con Estructuras de Datos

Los métodos están diseñados para trabajar con diversas estructuras de datos:

- Arrays de strings: `['id1', 'id2', 'id3']`
- Arrays de objetos: `[{id: 'id1'}, {id: 'id2'}]`
- Objetos como mapas: `{id1: {...}, id2: {...}}`

## Consideraciones de Rendimiento

- Para colecciones muy grandes (>10,000 elementos), considere aumentar la longitud máxima para minimizar el riesgo de colisiones.
- El uso de `includeTimestamp: true` mejora significativamente la unicidad con un impacto mínimo en el rendimiento.
- La verificación contra colecciones grandes puede afectar el rendimiento; considere implementar estructuras de datos optimizadas para búsqueda (como `Set` o `Map`) en estos casos.

## Compatibilidad

- Compatible con ECMAScript 6 y versiones superiores
- Funciona en navegadores modernos y Node.js
- No requiere dependencias externas
