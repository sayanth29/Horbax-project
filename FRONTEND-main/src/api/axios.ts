import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',

})

//its automatically attach toke to every req
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

//if token expired auto logout
api.interceptors.response.use(
    (response) =>response,
    (error) =>{
        if(error.response?.status === 401 && window.location.pathname !== '/login'){
            localStorage.removeItem('token')
            localStorage.removeItem('username')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)
export default api;