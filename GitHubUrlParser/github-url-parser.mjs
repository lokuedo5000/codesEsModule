/**
 * @module GitHubUrlParser
 * @description Módulo para analizar y extraer información de URLs de repositorios de GitHub.
 * @version 1.0.0
 */

/**
 * Errores específicos para el parser de URLs de GitHub
 */
export class GitHubUrlParserError extends Error {
  /**
   * @param {string} message - Mensaje de error
   * @param {string} url - URL que causó el error
   */
  constructor(message, url) {
    super(message);
    this.name = "GitHubUrlParserError";
    this.url = url;
    this.date = new Date();
  }
}

/**
 * Resultado del parsing de una URL de GitHub
 * @typedef {Object} ParseResult
 * @property {string} baseUrl - URL base del repositorio (con .git)
 * @property {Object|null} details - Detalles adicionales si están disponibles
 * @property {string|null} details.branch - Nombre de la rama
 * @property {string|null} details.folder - Ruta de la carpeta
 * @property {string} owner - Propietario del repositorio
 * @property {string} repo - Nombre del repositorio
 * @property {string} fullName - Nombre completo del repositorio (owner/repo)
 * @property {string|null} path - Ruta completa dentro del repositorio (si existe)
 */

/**
 * Clase principal para parsear URLs de GitHub
 */
export default class GitHubUrlParser {
  /**
   * Expresiones regulares para diferentes formatos de URL de GitHub
   * @private
   */
  static #patterns = {
    // URLs estándar de GitHub (incluyendo /tree/ y /blob/)
    standard:
      /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?(?:\/(?:tree|blob)\/([^\/]+)(?:\/(.+))?)?$/,
    // URLs de git clone
    gitUrl: /^(?:git@github\.com:)([^\/]+)\/([^\/]+)(?:\.git)?$/,
    // URLs https para clonar
    httpsClone:
      /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?$/,
  };

  /**
   * Verifica si una cadena es una URL válida
   * @private
   * @param {string} url - URL a verificar
   * @returns {boolean} - Verdadero si es una URL válida
   */
  static #isValidUrl(url) {
    if (!url || typeof url !== "string") {
      return false;
    }

    try {
      // Intentar crear un objeto URL para validar formato básico
      // Agregamos https:// si no tiene protocolo
      const urlString =
        url.startsWith("http") || url.startsWith("git@")
          ? url
          : `https://${url}`;

      // Para URLs con formato git@github.com:owner/repo.git no usamos new URL
      if (url.startsWith("git@")) {
        return true;
      }

      new URL(urlString);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Analiza una URL de GitHub y extrae sus componentes
   * @param {string} url - URL de GitHub a analizar
   * @returns {ParseResult} - Resultado del análisis
   * @throws {GitHubUrlParserError} - Si la URL no es válida o no corresponde a GitHub
   */
  static parse(url) {
    // Validar la entrada
    if (!url || typeof url !== "string") {
      throw new GitHubUrlParserError(
        "La URL no puede estar vacía y debe ser una cadena de texto",
        url
      );
    }

    // Comprobar si es una URL válida
    if (!this.#isValidUrl(url)) {
      throw new GitHubUrlParserError("Formato de URL inválido", url);
    }

    // Eliminar barras finales si existen
    const cleanUrl = url.replace(/\/+$/, "");

    // Intentar con los diferentes patrones
    for (const [patternName, pattern] of Object.entries(this.#patterns)) {
      const match = cleanUrl.match(pattern);

      if (match) {
        // Extraer componentes según el tipo de patrón
        const owner = match[1];
        const repo = match[2]?.replace(/\.git$/, "");
        const branch = match[3] || null;
        const path = match[4] || null;

        // Construir la URL base con formato .git
        const baseUrl = `https://github.com/${owner}/${repo}.git`;

        // Crear el objeto de detalles si hay información de rama y carpeta
        const details = branch ? { branch, folder: path } : null;

        return {
          baseUrl,
          details,
          owner,
          repo,
          fullName: `${owner}/${repo}`,
          path: path ? (branch ? `${branch}/${path}` : path) : null,
        };
      }
    }

    // Si llegamos aquí, ninguno de los patrones coincidió
    throw new GitHubUrlParserError(
      "URL no reconocida como repositorio válido de GitHub",
      url
    );
  }

  /**
   * Verifica si una URL es de GitHub
   * @param {string} url - URL a verificar
   * @param {function} errValidParse - un callback para un mensaje de error de parse de la url GitHub personalizado
   * @param {function} errValidUrl - un callback para un mensaje de error en caso de no ser una url
   * @returns {boolean} - Verdadero si es una URL de GitHub
   */
  static isGitHubUrl(url, errValidParse = false, errValidUrl = false) {
    if (!this.#isValidUrl(url)) {
      if (errValidUrl) errValidUrl();
      return false;
    }

    try {
      this.parse(url);
      return true;
    } catch (error) {
      if (errValidParse) errValidParse();
      return false;
    }
  }

  /**
   * Convierte una URL de GitHub al formato de clonación
   * @param {string} url - URL de GitHub
   * @returns {Object} - URLs para clonar en diferentes formatos
   * @throws {GitHubUrlParserError} - Si la URL no es válida
   */
  static toCloneUrl(url) {
    const parsed = this.parse(url);

    return {
      https: `https://github.com/${parsed.owner}/${parsed.repo}.git`,
      ssh: `git@github.com:${parsed.owner}/${parsed.repo}.git`,
      cli: `gh repo clone ${parsed.owner}/${parsed.repo}`,
    };
  }

  /**
   * Convierte una URL de GitHub a una URL de descarga ZIP
   * @param {string} url - URL de GitHub
   * @returns {string} - URL para descargar como ZIP
   * @throws {GitHubUrlParserError} - Si la URL no es válida
   */
  static toZipUrl(url) {
    const parsed = this.parse(url);
    const branch = parsed.details?.branch || "main";

    return `https://github.com/${parsed.owner}/${parsed.repo}/archive/refs/heads/${branch}.zip`;
  }

  /**
   * Genera URLs relacionadas con la URL proporcionada
   * @param {string} url - URL de GitHub
   * @returns {Object} - Objeto con URLs relacionadas
   * @throws {GitHubUrlParserError} - Si la URL no es válida
   */
  static getRelatedUrls(url) {
    const parsed = this.parse(url);
    const branch = parsed.details?.branch || "main";
    const path = parsed.details?.folder || "";

    return {
      repository: `https://github.com/${parsed.owner}/${parsed.repo}`,
      issues: `https://github.com/${parsed.owner}/${parsed.repo}/issues`,
      pulls: `https://github.com/${parsed.owner}/${parsed.repo}/pulls`,
      wiki: `https://github.com/${parsed.owner}/${parsed.repo}/wiki`,
      actions: `https://github.com/${parsed.owner}/${parsed.repo}/actions`,
      branches: `https://github.com/${parsed.owner}/${parsed.repo}/branches`,
      currentBranch: branch
        ? `https://github.com/${parsed.owner}/${parsed.repo}/tree/${branch}`
        : null,
      currentPath: path
        ? `https://github.com/${parsed.owner}/${parsed.repo}/tree/${branch}/${path}`
        : null,
    };
  }
}
