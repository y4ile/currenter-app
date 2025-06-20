import {
	createContext,
	useState,
	useEffect,
	useContext,
	type ReactNode,
} from 'react'
import { jwtDecode } from 'jwt-decode'

interface User {
	email: string
	nameid: string
}

interface AuthContextType {
	token: string | null
	user: User | null
	login: (newToken: string) => void
	logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
	const [token, setToken] = useState<string | null>(
		localStorage.getItem('token')
	)
	const [user, setUser] = useState<User | null>(null)

	useEffect(() => {
		if (token) {
			try {
				const decodedUser: User = jwtDecode(token) // <-- Декодируем токен
				setUser(decodedUser) // <-- Сохраняем пользователя в состояние
				localStorage.setItem('token', token)
			} catch (error) {
				console.error('Invalid token:', error)
				setUser(null)
				localStorage.removeItem('token')
			}
		} else {
			setUser(null)
			localStorage.removeItem('token')
		}
	}, [token])

	const login = (newToken: string) => {
		setToken(newToken)
	}

	const logout = () => {
		setToken(null)
	}

	return (
		<AuthContext.Provider value={{ token, user, login, logout }}>
			{children}
		</AuthContext.Provider>
	)
}

// Хук для удобного использования контекста
export function useAuth() {
	const context = useContext(AuthContext)
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider')
	}
	return context
}
