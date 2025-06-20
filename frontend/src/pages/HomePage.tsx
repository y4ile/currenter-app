import { useState, useEffect } from 'react'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import axiosInstance from '@/api/axiosInstance'
import { CurrencyComboBox } from '@/components/custom/CurrencyComboBox'

interface Currency {
	currencyCode: string
	rate: number
}

export function HomePage() {
	const [currencies, setCurrencies] = useState<Currency[]>([])
	const [fromCurrency, setFromCurrency] = useState<string>('USD')
	const [toCurrency, setToCurrency] = useState<string>('EUR')
	const [amount, setAmount] = useState<number>(1)
	const [result, setResult] = useState<number>(0)
	const [isLoading, setIsLoading] = useState(true)
	const [lastUpdated, setLastUpdated] = useState<string | null>(null)

	useEffect(() => {
		const fetchCurrencies = async () => {
			try {
				setIsLoading(true)
				const response = await axiosInstance.get('/api/currencies')
				setCurrencies(response.data)

				// Проверяем, что данные пришли и массив не пустой
				if (response.data && response.data.length > 0) {
					// Берем дату обновления из первой валюты (они все обновляются одновременно)
					const updateTimestamp = response.data[0].lastUpdated
					// Форматируем дату в удобный для чтения вид
					const formattedDate = new Date(updateTimestamp).toLocaleString()
					setLastUpdated(formattedDate)
				}
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

	if (isLoading) {
		return (
			<div className='flex h-screen w-full items-center justify-center'>
				Loading...
			</div>
		)
	}

	return (
		<div className='flex h-full w-full flex-col items-center justify-center bg-background p-4'>
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
						<div className='flex flex-row flex-auto gap-2'>
							<div className='flex flex-col gap-2'>
								<p className='text-sm text-muted-foreground'>From</p>
								<CurrencyComboBox
									currencies={currencies}
									value={fromCurrency}
									onValueChange={setFromCurrency}
									placeholder='From'
								/>
							</div>
							<div className='flex flex-col gap-2'>
								<p className='text-sm text-muted-foreground'>Amount</p>
								<Input
									type='number'
									value={amount.toString()}
									onChange={e => setAmount(Number(e.target.value))}
								/>
							</div>
							<div className='flex flex-col gap-2'>
								<p className='text-sm text-muted-foreground'>To</p>
								<CurrencyComboBox
									currencies={currencies}
									value={toCurrency}
									onValueChange={setToCurrency}
									placeholder='To'
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Карточка №2: Результат и график */}
				<Card>
					<CardHeader>
						<CardDescription>Converted</CardDescription>
						<CardTitle className='text-4xl'>
							{result.toFixed(4)} {toCurrency}
						</CardTitle>
						<CardDescription>
							+0.0% from yesterday (placeholder)
						</CardDescription>
					</CardHeader>
					{lastUpdated && (
						<CardFooter>
							<a
								href='https://app.exchangerate-api.com/'
								className='text-xs text-muted-foreground'
							>
								Last updated: {lastUpdated}
							</a>
						</CardFooter>
					)}
				</Card>
			</div>
		</div>
	)
}
