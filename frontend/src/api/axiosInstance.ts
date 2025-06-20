import axios from 'axios'
import { toast } from 'sonner'

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

axiosInstance.interceptors.response.use(
	// Обработка успешных ответов (просто пробрасываем их дальше)
	response => {
		return response
	},
	// Обработка ошибок
	error => {
		// Если мы получили ошибку 401 Unauthorized
		if (error.response && error.response.status === 401) {
			// Очищаем токен из хранилища
			localStorage.removeItem('token')
			window.location.href = '/auth'
			toast.error('Your session expired')
		}
		// Для всех других ошибок, просто пробрасываем их дальше
		return Promise.reject(error)
	}
)

export default axiosInstance
