import axios from 'axios'

const axiosInstance = axios.create({
	// baseURL здесь не указываем, так как он разный для Docker и локальной разработки
})

axiosInstance.interceptors.request.use(
	config => {
		const token = localStorage.getItem('token')
		const apiBaseURL = import.meta.env.VITE_API_BASE_URL

		// Формируем полный URL здесь
		config.url = `${apiBaseURL}${config.url}`

		if (token) {
			config.headers.Authorization = `Bearer ${token}`
		}
		return config
	},
	error => {
		return Promise.reject(error)
	}
)

export default axiosInstance
