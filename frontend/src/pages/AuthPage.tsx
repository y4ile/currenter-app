import { useState } from 'react'
import axiosInstance from '@/api/axiosInstance'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

export function AuthPage() {
    const { login } = useAuth()
	const [isLoginView, setIsLoginView] = useState(true)

	// Состояния для хранения значений полей ввода
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')

	// Состояние для отображения ошибок
	const [error, setError] = useState('')

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault() // Предотвращаем стандартную перезагрузку страницы
		setError('') // Сбрасываем предыдущие ошибки

		const endpoint = isLoginView ? '/api/auth/login' : '/api/auth/register'
		const payload = isLoginView
			? { email, password }
			: { name, email, password }

		try {
			const response = await axiosInstance.post(endpoint, payload)
			console.log('Server response:', response.data)

			if (response.data.token) {
				login(response.data.token)
			} else {
				toast.success('Registration completed successfully!')
				setIsLoginView(true)
				//alert('Успешная регистрация! Теперь вы можете войти.')
				//setIsLoginView(true)
			}
		} catch (err: any) {
			console.error('Response error:', err)
			// Устанавливаем сообщение об ошибке, которое пришло с бэкенда
			const errorMessage =
				err.response?.data?.message || err.response?.data || 'Error ocurred'
			setError(errorMessage)
		}
	}

	return (
		<>
			<div className='flex h-screen w-full items-center justify-center bg-background'>
				<Card className='w-full max-w-sm'>
					<CardHeader>
						<CardTitle className='text-2xl'>
							{isLoginView ? 'Login' : 'Create an account'}
						</CardTitle>
						<CardDescription>
							{isLoginView
								? 'Enter your email below to login to your account.'
								: 'Enter your details below to create your account.'}
						</CardDescription>
					</CardHeader>
					<form onSubmit={handleSubmit}>
						<CardContent className='grid gap-4'>
							{!isLoginView && (
								<div className='grid gap-2'>
									<Label htmlFor='name'>Name</Label>
									<Input
										id='name'
										placeholder='Ma Boy'
										required
										value={name}
										onChange={e => setName(e.target.value)} // Обновляем состояние
									/>
								</div>
							)}
							<div className='grid gap-2'>
								<Label htmlFor='email'>Email</Label>
								<Input
									id='email'
									type='email'
									placeholder='test@example.com'
									required
									value={email}
									onChange={e => setEmail(e.target.value)} // Обновляем состояние
								/>
							</div>
							<div className='grid gap-2'>
								<Label htmlFor='password'>Password</Label>
								<Input
									id='password'
									type='password'
									required
									value={password}
									onChange={e => setPassword(e.target.value)} // Обновляем состояние
								/>
							</div>
							{/* Отображаем ошибку, если она есть */}
							{error && (
								<Alert variant='destructive'>
									<AlertTriangle className='h-4 w-4' />
									<AlertTitle>Authentication Failed</AlertTitle>
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}
							<Button type='submit' className='w-full'>
								{isLoginView ? 'Login' : 'Create account'}
							</Button>
						</CardContent>
					</form>
					<div className='mb-6 text-center text-sm'>
						{isLoginView
							? "Don't have an account?"
							: 'Already have an account?'}
						<button
							onClick={() => {
								setIsLoginView(!isLoginView)
								setError('') // Сбрасываем ошибку при переключении
							}}
							className='ml-1 underline'
						>
							{isLoginView ? 'Sign up' : 'Login'}
						</button>
					</div>
				</Card>
			</div>
		</>
	)
}
