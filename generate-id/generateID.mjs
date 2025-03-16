class GenerateID {
  constructor(options = {}) {
    this.maxLength = options.maxLength || 8;
    this.minLength = 4;
  }

  /**
   * Generador de ID unicos ramdos y super robusto y avanzados para evitar duplicados
   * @param {Object} options - Opciones adicionales para la generación
   * @param {boolean} options.includeTimestamp - Incluir timestamp para mayor unicidad
   * @param {boolean} options.includeSpecialChars - Incluir caracteres especiales
   * @param {boolean} options.useUppercase - Incluir letras mayúsculas
   * @returns {string} ID único generado
   */
  generate(options = {}) {
    const includeTimestamp = options.includeTimestamp !== undefined ? options.includeTimestamp : true;
    const includeSpecialChars = options.includeSpecialChars !== undefined ? options.includeSpecialChars : false;
    const useUppercase = options.useUppercase !== undefined ? options.useUppercase : true;
    
    // Caracteres disponibles para el ID
    let chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    if (useUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeSpecialChars) chars += '_-.$#@!%&';
    
    // Longitud final del ID (respetando min y max)
    const finalLength = Math.max(
      this.minLength,
      Math.min(this.maxLength, Math.floor(Math.random() * this.maxLength) + this.minLength)
    );
    
    // Componente de entropía basado en Math.random()
    let id = '';
    for (let i = 0; i < finalLength; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Añadir componente de timestamp si está habilitado
    if (includeTimestamp) {
      // Usar timestamp parcial para no exceder longitud máxima
      const timestamp = Date.now().toString(36);
      // Mezclar el timestamp con la parte aleatoria
      id = id.substring(0, Math.floor(finalLength / 2)) + 
           timestamp.substring(timestamp.length - 3) + 
           id.substring(Math.floor(finalLength / 2), finalLength - 3);
    }
    
    // Añadir entropía adicional con crypto si está disponible
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const randomBuffer = new Uint8Array(1);
      crypto.getRandomValues(randomBuffer);
      const additionalChar = chars.charAt(randomBuffer[0] % chars.length);
      id = additionalChar + id.substring(0, id.length - 1);
    }
    
    return id;
  }
  
  /**
   * Verifica si un ID ya existe en una colección dada
   * @param {string} id - ID a verificar
   * @param {Array|Object} collection - Colección donde verificar duplicados
   * @param {string} idField - Nombre del campo ID en objetos (opcional)
   * @returns {boolean} true si existe, false si no
   */
  exists(id, collection, idField = 'id') {
    if (Array.isArray(collection)) {
      if (typeof collection[0] === 'object') {
        return collection.some(item => item[idField] === id);
      }
      return collection.includes(id);
    } else if (typeof collection === 'object') {
      return Object.prototype.hasOwnProperty.call(collection, id) || 
             Object.values(collection).some(item => 
               item && typeof item === 'object' && item[idField] === id
             );
    }
    return false;
  }
  
  /**
   * Genera un ID único garantizado verificando contra una colección
   * @param {Array|Object} collection - Colección donde verificar duplicados
   * @param {Object} options - Opciones para la generación
   * @param {string} idField - Nombre del campo ID en objetos (opcional)
   * @returns {string} ID único garantizado
   */
  generateUnique(collection, options = {}, idField = 'id') {
    let newId;
    let attempts = 0;
    const maxAttempts = 100; // Límite para evitar bucles infinitos
    
    do {
      newId = this.generate(options);
      attempts++;
    } while (this.exists(newId, collection, idField) && attempts < maxAttempts);
    
    if (attempts >= maxAttempts) {
      // Si no se pudo generar un ID único, aumentar la longitud
      const extendedOptions = {...options};
      this.maxLength += 2;
      newId = this.generate(extendedOptions);
    }
    
    return newId;
  }
}

export default GenerateID;
