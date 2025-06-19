import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AuthPage } from './pages/AuthPage'
import { HomePage } from './pages/HomePage'

function AppRoutes() {
	const { token } = useAuth()

	return (
		<Routes>
			<Route
				path='/auth'
				element={!token ? <AuthPage /> : <Navigate to='/' />}
			/>
			<Route
				path='/'
				element={token ? <HomePage /> : <Navigate to='/auth' />}
			/>
			<Route path='*' element={<Navigate to='/' />} />
		</Routes>
	)
}

function App() {
	return (
		<Router>
			<AuthProvider>
				<AppRoutes />
			</AuthProvider>
		</Router>
	)
}

export default App
