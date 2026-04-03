import axios from 'axios'

const API = axios.create({ baseURL: '/api' })  // Proxies to backend:5000

export const getGrid = () => API.get('/status/grid')
export const getOccupancy = () => API.get('/status/occupancy')
// Add more later