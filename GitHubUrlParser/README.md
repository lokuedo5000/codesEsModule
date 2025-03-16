# GitHubUrlParser

![Versión](https://img.shields.io/badge/versión-1.0.0-blue.svg)
![ES6](https://img.shields.io/badge/ES-6-yellow.svg)
![Licencia](https://img.shields.io/badge/licencia-MIT-green.svg)

Módulo JavaScript ES6 para analizar y manipular URLs de repositorios de GitHub. Esta herramienta permite extraer y procesar información de las URLs de GitHub en diferentes formatos, así como generar URLs relacionadas para varios propósitos.

## Contenido

- [Instalación](#instalación)
- [Uso básico](#uso-básico)
- [API](#api)
  - [Métodos](#métodos)
  - [Tipos de datos](#tipos-de-datos)
  - [Manejo de errores](#manejo-de-errores)
- [Ejemplos](#ejemplos)
- [Formatos de URL soportados](#formatos-de-url-soportados)
- [Contribuir](#contribuir)
- [Licencia](#licencia)

## Instalación

Importa el módulo a tu proyecto:

```javascript
import GitHubUrlParser from './github-url-parser.mjs';
```

## Uso básico

```javascript
import GitHubUrlParser from './github-url-parser.mjs';

// Parsear una URL de GitHub
const repositoryInfo = GitHubUrlParser.parse('https://github.com/usuario/repositorio/tree/main/carpeta');

console.log(repositoryInfo);
// Resultado:
// {
//   baseUrl: 'https://github.com/usuario/repositorio.git',
//   details: { branch: 'main', folder: 'carpeta' },
//   owner: 'usuario',
//   repo: 'repositorio',
//   fullName: 'usuario/repositorio',
//   path: 'main/carpeta'
// }
```

## API

### Métodos

#### `GitHubUrlParser.parse(url)`

Analiza una URL de GitHub y extrae sus componentes.

- **Parámetros**:
  - `url` (string): URL de GitHub a analizar
- **Retorna**: [ParseResult](#parseresult)
- **Lanza**: [GitHubUrlParserError](#githuburlparsererror) si la URL no es válida o no corresponde a GitHub

```javascript
const info = GitHubUrlParser.parse('https://github.com/usuario/repo');
```

#### `GitHubUrlParser.isGitHubUrl(url)`

Verifica si una URL pertenece a GitHub.

- **Parámetros**:
  - `url` (string): URL a verificar
- **Retorna**: boolean - `true` si es una URL válida de GitHub, `false` en caso contrario

```javascript
const isValid = GitHubUrlParser.isGitHubUrl('https://github.com/usuario/repo');
// isValid: true
```

#### `GitHubUrlParser.toCloneUrl(url)`

Convierte una URL de GitHub a diferentes formatos para clonar el repositorio.

- **Parámetros**:
  - `url` (string): URL de GitHub
- **Retorna**: Object - Objeto con URLs para clonar en diferentes formatos
  - `https`: URL para clonar usando HTTPS
  - `ssh`: URL para clonar usando SSH
  - `cli`: Comando para clonar usando GitHub CLI
- **Lanza**: [GitHubUrlParserError](#githubUrlparserError) si la URL no es válida

```javascript
const cloneUrls = GitHubUrlParser.toCloneUrl('https://github.com/usuario/repo');
// {
//   https: 'https://github.com/usuario/repo.git',
//   ssh: 'git@github.com:usuario/repo.git',
//   cli: 'gh repo clone usuario/repo'
// }
```

#### `GitHubUrlParser.toZipUrl(url)`

Convierte una URL de GitHub a una URL para descargar el repositorio como archivo ZIP.

- **Parámetros**:
  - `url` (string): URL de GitHub
- **Retorna**: string - URL para descargar el repositorio como ZIP
- **Lanza**: [GitHubUrlParserError](#githubUrlparserError) si la URL no es válida

```javascript
const zipUrl = GitHubUrlParser.toZipUrl('https://github.com/usuario/repo');
// 'https://github.com/usuario/repo/archive/refs/heads/main.zip'
```

#### `GitHubUrlParser.getRelatedUrls(url)`

Genera URLs relacionadas con el repositorio.

- **Parámetros**:
  - `url` (string): URL de GitHub
- **Retorna**: Object - Objeto con URLs relacionadas
  - `repository`: URL principal del repositorio
  - `issues`: URL de la sección de issues
  - `pulls`: URL de la sección de pull requests
  - `wiki`: URL de la wiki del repositorio
  - `actions`: URL de GitHub Actions
  - `branches`: URL de la lista de ramas
  - `currentBranch`: URL de la rama actual (si está disponible)
  - `currentPath`: URL de la ruta actual (si está disponible)
- **Lanza**: [GitHubUrlParserError](#githubUrlparserError) si la URL no es válida

```javascript
const relatedUrls = GitHubUrlParser.getRelatedUrls('https://github.com/usuario/repo/tree/main/src');
// {
//   repository: 'https://github.com/usuario/repo',
//   issues: 'https://github.com/usuario/repo/issues',
//   pulls: 'https://github.com/usuario/repo/pulls',
//   wiki: 'https://github.com/usuario/repo/wiki',
//   actions: 'https://github.com/usuario/repo/actions',
//   branches: 'https://github.com/usuario/repo/branches',
//   currentBranch: 'https://github.com/usuario/repo/tree/main',
//   currentPath: 'https://github.com/usuario/repo/tree/main/src'
// }
```

### Tipos de datos

#### ParseResult

Resultado del análisis de una URL de GitHub.

```typescript
{
  baseUrl: string,       // URL base del repositorio (con .git)
  details: {             // Detalles adicionales o null si no están disponibles
    branch: string,      // Nombre de la rama
    folder: string       // Ruta de la carpeta
  } | null,
  owner: string,         // Propietario del repositorio
  repo: string,          // Nombre del repositorio
  fullName: string,      // Nombre completo del repositorio (owner/repo)
  path: string | null    // Ruta completa dentro del repositorio (si existe)
}
```

### Manejo de errores

#### GitHubUrlParserError

Clase de error personalizada para el parser de URLs de GitHub.

```javascript
import { GitHubUrlParserError } from 'github-url-parser';

try {
  const info = GitHubUrlParser.parse('https://invalid-url');
} catch (error) {
  if (error instanceof GitHubUrlParserError) {
    console.error(`Error en la URL: ${error.message}`);
    console.error(`URL problemática: ${error.url}`);
    console.error(`Ocurrido en: ${error.date}`);
  }
}
```

Propiedades del error:
- `message`: Mensaje descriptivo del error
- `url`: URL que causó el error
- `date`: Fecha y hora en que ocurrió el error

## Ejemplos

### Ejemplo 1: Parsing básico

```javascript
import GitHubUrlParser from 'github-url-parser';

// URL estándar de GitHub
const url1 = 'https://github.com/usuario/repositorio';
console.log(GitHubUrlParser.parse(url1));

// URL con rama y carpeta específica
const url2 = 'https://github.com/usuario/repositorio/tree/desarrollo/src/components';
console.log(GitHubUrlParser.parse(url2));

// URL de clonación SSH
const url3 = 'git@github.com:usuario/repositorio.git';
console.log(GitHubUrlParser.parse(url3));
```

### Ejemplo 2: Manejo de errores

```javascript
import GitHubUrlParser, { GitHubUrlParserError } from 'github-url-parser';

try {
  // Intentar parsear una URL no válida
  const result = GitHubUrlParser.parse('https://ejemplo.com/no-es-github');
} catch (error) {
  if (error instanceof GitHubUrlParserError) {
    console.error(`Error: ${error.message}`);
  } else {
    console.error(`Error inesperado: ${error.message}`);
  }
}
```

### Ejemplo 3: Obtener diferentes formatos de URL

```javascript
import GitHubUrlParser from 'github-url-parser';

const url = 'https://github.com/usuario/proyecto/tree/main/src';

// Obtener URLs para clonar
const cloneUrls = GitHubUrlParser.toCloneUrl(url);
console.log(`HTTPS: ${cloneUrls.https}`);
console.log(`SSH: ${cloneUrls.ssh}`);
console.log(`GitHub CLI: ${cloneUrls.cli}`);

// Obtener URL para descargar como ZIP
const zipUrl = GitHubUrlParser.toZipUrl(url);
console.log(`Descargar ZIP: ${zipUrl}`);

// Obtener URLs relacionadas
const related = GitHubUrlParser.getRelatedUrls(url);
console.log(`Issues: ${related.issues}`);
console.log(`Wiki: ${related.wiki}`);
```

## Formatos de URL soportados

GitHubUrlParser puede analizar múltiples formatos de URL de GitHub:

- **URL estándar**: `https://github.com/usuario/repositorio`
- **URL con rama**: `https://github.com/usuario/repositorio/tree/rama`
- **URL con rama y carpeta**: `https://github.com/usuario/repositorio/tree/rama/carpeta`
- **URL con blob**: `https://github.com/usuario/repositorio/blob/rama/archivo.js`
- **URL con .git**: `https://github.com/usuario/repositorio.git`
- **URL SSH**: `git@github.com:usuario/repositorio.git`

## Contribuir

Las contribuciones son bienvenidas. Por favor, sigue estos pasos:

1. Haz fork del repositorio
2. Crea una rama para tu característica (`git checkout -b feature/amazing-feature`)
3. Realiza tus cambios
4. Ejecuta las pruebas (`npm test`)
5. Haz commit de tus cambios (`git commit -m 'Añade una característica increíble'`)
6. Haz push a la rama (`git push origin feature/amazing-feature`)
7. Abre un Pull Request

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.
