import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
	Outlet,
} from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AuthPage } from './pages/AuthPage'
import { HomePage } from './pages/HomePage'
import { Header } from './components/custom/Header'
import { Toaster } from '@/components/ui/sonner'

function ProtectedLayout() {
	return (
		<div>
			<Header />
			<main>
				<Outlet />
			</main>
		</div>
	)
}

function AppRoutes() {
	const { token } = useAuth()

	return (
		<Routes>
			<Route
				path='/auth'
				element={!token ? <AuthPage /> : <Navigate to='/' />}
			/>

			<Route element={token ? <ProtectedLayout /> : <Navigate to='/auth' />}>
				<Route path='/' element={<HomePage />} />
			</Route>

			<Route path='*' element={<Navigate to='/' />} />
		</Routes>
	)
}

function App() {
	return (
		<Router>
			<AuthProvider>
				<AppRoutes />
				<Toaster position='bottom-center' />
			</AuthProvider>
		</Router>
	)
}

export default App
