import {
	createContext,
	useState,
	useEffect,
	useContext,
	type ReactNode,
} from 'react'

interface AuthContextType {
	token: string | null
	login: (newToken: string) => void
	logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
	const [token, setToken] = useState<string | null>(
		localStorage.getItem('token')
	)

	useEffect(() => {
		// Синхронизируем localStorage при изменении токена
		if (token) {
			localStorage.setItem('token', token)
		} else {
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
		<AuthContext.Provider value={{ token, login, logout }}>
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
