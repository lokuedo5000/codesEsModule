// Módulo generador de userID único basado en hardware/OS para Node.js
// ES Module

import os from 'os';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';

/**
 * Genera un ID único basado en información del sistema que es difícil de modificar
 * sin cambiar el hardware o sistema operativo
 */
export class UniqueUserIDGenerator {
  constructor() {
    this.userID = null;
    this.storageFile = path.join(os.homedir(), '.unique_hw_id');
  }

  /**
   * Obtiene información del sistema operativo y hardware
   * @returns {Object} Información recopilada del sistema
   */
  async getSystemInfo() {
    const info = {
      platform: os.platform(),
      release: os.release(),
      type: os.type(),
      arch: os.arch(),
      cpus: os.cpus().length,
      cpuModel: os.cpus()[0]?.model || '',
      totalMemory: os.totalmem(),
      hostname: os.hostname(),
      networkInterfaces: this.getNetworkMACs(),
      homedir: os.homedir(),
    };

    // Para Windows
    if (os.platform() === 'win32') {
      try {
        // Serial del disco C:
        const diskSerial = execSync('wmic diskdrive get SerialNumber').toString().trim();
        info.diskSerial = diskSerial.split('\n')[1] || '';
        
        // Serial de la BIOS
        const biosSerial = execSync('wmic bios get SerialNumber').toString().trim();
        info.biosSerial = biosSerial.split('\n')[1] || '';
        
        // UUID de la placa base
        const motherboardUUID = execSync('wmic csproduct get UUID').toString().trim();
        info.motherboardUUID = motherboardUUID.split('\n')[1] || '';
        
        // CPU ID
        const cpuId = execSync('wmic cpu get ProcessorId').toString().trim();
        info.cpuId = cpuId.split('\n')[1] || '';
      } catch (e) {
        // Si falla alguna ejecución, simplemente continuamos
      }
    }

    // Para Linux
    if (os.platform() === 'linux') {
      try {
        // DMI system-uuid (muy consistente en Linux)
        const systemUUID = execSync('cat /sys/class/dmi/id/product_uuid 2>/dev/null').toString().trim();
        info.systemUUID = systemUUID;
        
        // Serial de la placa base
        const motherboardSerial = execSync('cat /sys/class/dmi/id/board_serial 2>/dev/null').toString().trim();
        info.motherboardSerial = motherboardSerial;
        
        // CPU Info (información detallada del procesador)
        const cpuInfo = execSync('cat /proc/cpuinfo | grep -m 1 "physical id" && cat /proc/cpuinfo | grep -m 1 "serial" && cat /proc/cpuinfo | grep -m 1 "Hardware"').toString().trim();
        info.cpuDetails = cpuInfo;
        
        // Información del disco principal
        const diskInfo = execSync('lsblk -no UUID $(findmnt -n -o SOURCE /)', { encoding: 'utf8' }).toString().trim();
        info.mainDiskUUID = diskInfo;
      } catch (e) {
        // Si falla alguna ejecución, simplemente continuamos
      }
    }

    // Para MacOS
    if (os.platform() === 'darwin') {
      try {
        // Hardware UUID (muy consistente en Mac)
        const hardwareUUIDOutput = execSync('system_profiler SPHardwareDataType | grep "Hardware UUID"').toString().trim();
        info.hardwareUUID = hardwareUUIDOutput.split(': ')[1] || '';
        
        // Serial Number del dispositivo
        const serialNumberOutput = execSync('system_profiler SPHardwareDataType | grep "Serial Number"').toString().trim();
        info.serialNumber = serialNumberOutput.split(': ')[1] || '';
        
        // Model Identifier
        const modelOutput = execSync('system_profiler SPHardwareDataType | grep "Model Identifier"').toString().trim();
        info.modelIdentifier = modelOutput.split(': ')[1] || '';
      } catch (e) {
        // Si falla alguna ejecución, simplemente continuamos
      }
    }

    return info;
  }

  /**
   * Obtiene direcciones MAC de las interfaces de red
   * @returns {Array} Lista de direcciones MAC
   */
  getNetworkMACs() {
    const interfaces = os.networkInterfaces();
    const macs = [];

    // Extraer direcciones MAC de cada interfaz de red física (no virtual)
    Object.keys(interfaces).forEach(iface => {
      interfaces[iface].forEach(details => {
        if (!details.internal && details.mac !== '00:00:00:00:00:00') {
          macs.push(details.mac);
        }
      });
    });

    // Ordenamos las MACs para asegurar consistencia incluso al añadir nuevas interfaces
    return macs.sort();
  }

  /**
   * Genera un hash a partir de una cadena
   * @param {string} str - Cadena a hashear
   * @returns {string} Valor hash
   */
  hashString(str) {
    return crypto.createHash('sha256').update(str).digest('hex');
  }

  /**
   * Genera un ID único basado en la información del sistema
   * @returns {Promise<string>} ID único del usuario
   */
  async generateID() {
    // Verificar si ya existe un ID almacenado
    try {
      if (fs.existsSync(this.storageFile)) {
        this.userID = fs.readFileSync(this.storageFile, 'utf8');
        return this.userID;
      }
    } catch (e) {
      console.error("Error leyendo ID almacenado:", e);
    }
    
    // Obtener información del sistema
    const systemInfo = await this.getSystemInfo();
    
    // Generar un string con toda la información combinada
    // NO incluimos semilla aleatoria para asegurar consistencia
    const infoString = JSON.stringify(systemInfo);
    
    // Generar hash para obtener el ID
    this.userID = this.hashString(infoString);
    
    // Guardar ID en un archivo oculto en el directorio home del usuario
    try {
      fs.writeFileSync(this.storageFile, this.userID, { mode: 0o600 }); // Permisos restrictivos
    } catch (e) {
      console.error("Error al guardar ID en archivo:", e);
    }
    
    return this.userID;
  }

  /**
   * Verifica si el ID actual es válido
   * @returns {Promise<boolean>} true si el ID es válido
   */
  async verifyID() {
    try {
      if (!fs.existsSync(this.storageFile)) {
        return false;
      }
      
      const storedID = fs.readFileSync(this.storageFile, 'utf8');
      if (!storedID) return false;
      
      return true;
    } catch (e) {
      console.error("Error verificando ID:", e);
      return false;
    }
  }
}

/**
 * Crea y devuelve una instancia única del generador de ID
 * @returns {Promise<string>} ID único del usuario
 */
export async function getUniqueUserID() {
  const generator = new UniqueUserIDGenerator();
  return await generator.generateID();
}

// Exportación por defecto para facilitar su uso
export default { getUniqueUserID };
