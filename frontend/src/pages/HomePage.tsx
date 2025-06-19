import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'

export function HomePage() {
	const { logout } = useAuth()
	return (
		<div>
			<h1>Главная страница (Защищенная)</h1>
			<p>Вы вошли в систему.</p>
			<Button onClick={logout}>Выйти</Button>
		</div>
	)
}
