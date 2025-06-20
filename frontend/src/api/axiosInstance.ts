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
	// Успешный ответ просто пробрасываем дальше
	response => response,

	// Обрабатываем ошибки
	error => {
		const originalRequest = error.config

		// Безопасно получаем URL, чтобы избежать ошибок, если он пустой
		const url = originalRequest.url || ''

		// Проверяем, что это ошибка 401 и что URL НЕ ВКЛЮЧАЕТ пути для входа/регистрации
		if (
			error.response?.status === 401 &&
			!url.includes('/auth/login') &&
			!url.includes('/auth/register')
		) {
			// Это ошибка на защищенном роуте, значит, токен истек
			localStorage.removeItem('token')
			window.location.href = '/auth'
			toast.error('Ваша сессия истекла')
		}

		// Для всех других ошибок (включая 401 при логине) просто пробрасываем их дальше
		return Promise.reject(error)
	}
)

export default axiosInstance
