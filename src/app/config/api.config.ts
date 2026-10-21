/**
 * Configuración de Conexión con la API de Emitta
 * 
 * Para trabajar en LOCAL:
 *   baseUrl: '/api/v1'  (Usa el proxy hacia http://localhost:18080)
 * 
 * Para trabajar en LA NUBE (Staging / Producción):
 *   baseUrl: 'https://api-emitta.nexorf.dev/api/v1'
 * 
 * Aquí es donde debes colocar tu clientId y clientSecret entregados por el responsable:
 */
export const API_CONFIG = {
  // Usa el proxy de Angular hacia https://api-emitta.nexorf.dev
  baseUrl: '/api/v1',

  // Credenciales de la aplicación cliente (Machine-to-Machine OAuth2)
  clientId: 'emitta_0f0b2e0c-b6e3-4212-835b-0f7086d32aaa',
  clientSecret: '4JfhIbySCySjQN0hxcaIBY36d29GtaBCQWSOzVRxYKo'
};
