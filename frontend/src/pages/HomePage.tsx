import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import axiosInstance from '@/api/axiosInstance'
import { CurrencyChart } from '@/components/custom/CurrencyChart' // <-- Импортируем наш новый график

interface Currency {
	currencyCode: string
	rate: number
}

export function HomePage() {
	const { logout } = useAuth()
	const [currencies, setCurrencies] = useState<Currency[]>([])
	const [fromCurrency, setFromCurrency] = useState<string>('USD')
	const [toCurrency, setToCurrency] = useState<string>('EUR')
	const [amount, setAmount] = useState<number>(1)
	const [result, setResult] = useState<number>(0)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const fetchCurrencies = async () => {
			try {
				setIsLoading(true)
				const response = await axiosInstance.get('/api/currencies')
				setCurrencies(response.data)
			} catch (error) {
				console.error('Failed to fetch currencies', error)
			} finally {
				setIsLoading(false)
			}
		}
		fetchCurrencies()
	}, [])

	useEffect(() => {
		if (currencies.length === 0) return
		const fromRate = currencies.find(c => c.currencyCode === fromCurrency)?.rate
		const toRate = currencies.find(c => c.currencyCode === toCurrency)?.rate
		if (fromRate && toRate) {
			const convertedAmount = (amount / fromRate) * toRate
			setResult(convertedAmount)
		}
	}, [amount, fromCurrency, toCurrency, currencies])

	const currencyOptions = useMemo(
		() =>
			currencies.map(c => (
				<SelectItem key={c.currencyCode} value={c.currencyCode}>
					{c.currencyCode}
				</SelectItem>
			)),
		[currencies]
	)

	if (isLoading) {
		return (
			<div className='flex h-screen w-full items-center justify-center'>
				Loading...
			</div>
		)
	}

	return (
		<div className='flex h-screen w-full flex-col items-center justify-center bg-background p-4'>
			<div className='grid w-full max-w-xl gap-6'>
				{/* Карточка №1: Ввод данных */}
				<Card>
					<CardHeader>
						<CardTitle>Currency Converter</CardTitle>
						<CardDescription>
							Select currencies and enter an amount to convert.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
							<div className='flex flex-col gap-2'>
								<p className='text-sm text-muted-foreground'>Amount</p>
								<Input
									type='number'
									value={amount}
									onChange={e => setAmount(Number(e.target.value))}
								/>
							</div>
							<div className='flex flex-col gap-2'>
								<p className='text-sm text-muted-foreground'>From</p>
								<Select value={fromCurrency} onValueChange={setFromCurrency}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>{currencyOptions}</SelectContent>
								</Select>
							</div>
							<div className='flex flex-col gap-2'>
								<p className='text-sm text-muted-foreground'>To</p>
								<Select value={toCurrency} onValueChange={setToCurrency}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>{currencyOptions}</SelectContent>
								</Select>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Карточка №2: Результат и график */}
				<Card>
					<CardHeader>
						<CardDescription>Result</CardDescription>
						<CardTitle className='text-4xl'>
							{result.toFixed(4)} {toCurrency}
						</CardTitle>
						<CardDescription>
							+0.0% from yesterday (placeholder)
						</CardDescription>
					</CardHeader>
					<CardContent>
						<CurrencyChart />
					</CardContent>
				</Card>
			</div>

			<Button
				onClick={logout}
				variant='outline'
				className='absolute top-4 right-4'
			>
				Logout
			</Button>
		</div>
	)
}
