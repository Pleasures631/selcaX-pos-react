// export const BASE_URL = 'http://localhost:8000/'; 
export const BASE_URL = 'http://10.0.2.2:8000/';
// export const BASE_URL = 'http://192.168.0.101:8000/';


export const API = {
  login: `${BASE_URL}api/login`,
  register: `${BASE_URL}api/register`,
  products: `${BASE_URL}api/items/create`,
  getProducts: `${BASE_URL}api/items`,
  addOrder: `${BASE_URL}api/order/create`,
  getOrder: `${BASE_URL}api/orders`,
  splitOrder: `${BASE_URL}api/order/split`,
};
