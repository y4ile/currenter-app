import { useState, useEffect, useMemo } from 'react'
import axiosInstance from '@/api/axiosInstance'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import {
	Command,
	CommandInput,
} from '@/components/ui/command'
import { toast } from 'sonner'

interface User {
	id: number
	name: string
}
interface Currency {
	currencyCode: string
}

interface ManageCurrenciesDialogProps {
	user: User | null
	isOpen: boolean
	onOpenChange: (open: boolean) => void
}

export function ManageCurrenciesDialog({
	user,
	isOpen,
	onOpenChange,
}: ManageCurrenciesDialogProps) {
	const [allCurrencies, setAllCurrencies] = useState<Currency[]>([])
	const [userCurrencies, setUserCurrencies] = useState<Set<string>>(new Set())

    const [searchTerm, setSearchTerm] = useState('')

    const filteredCurrencies = useMemo(() => {
			if (!searchTerm) {
				return allCurrencies // Если поиск пустой, возвращаем все валюты
			}
			return allCurrencies.filter(currency =>
				currency.currencyCode.toLowerCase().includes(searchTerm.toLowerCase())
			)
		}, [searchTerm, allCurrencies])

	useEffect(() => {
		if (isOpen && user) {
			// Загружаем все валюты и доступы пользователя одновременно
			Promise.all([
				axiosInstance.get('/api/admin/currencies'),
				axiosInstance.get(`/api/admin/users/${user.id}/currencies`),
			])
				.then(([allCurrenciesResponse, userCurrenciesResponse]) => {
					setAllCurrencies(allCurrenciesResponse.data)
					setUserCurrencies(new Set(userCurrenciesResponse.data))
				})
				.catch(err => {
					console.error('Failed to fetch currency data for admin dialog', err)
					toast.error('Failed to load data.')
				})
		}
	}, [isOpen, user])

	const handleAccessChange = async (currencyCode: string, checked: boolean) => {
		if (!user) return

		try {
			if (checked) {
				// Предоставляем доступ
				await axiosInstance.post(`/api/admin/users/${user.id}/currencies`, {
					currencyCode,
				})
				setUserCurrencies(prev => new Set(prev).add(currencyCode))
				toast.success(`Access to ${currencyCode} granted.`)
			} else {
				// Отзываем доступ
				await axiosInstance.delete(
					`/api/admin/users/${user.id}/currencies/${currencyCode}`
				)
				setUserCurrencies(prev => {
					const newSet = new Set(prev)
					newSet.delete(currencyCode)
					return newSet
				})
				toast.success(`Access to ${currencyCode} revoked.`)
			}
		} catch (error) {
			toast.error('Failed to update permissions.')
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>Manage Currencies for {user?.name}</DialogTitle>
					<DialogDescription>
						Select the currencies this user can access.
					</DialogDescription>
				</DialogHeader>

				<Command>
					<CommandInput
						placeholder='Search currency...'
						value={searchTerm}
						onValueChange={setSearchTerm}
					/>
				</Command>

				<div className='py-4 h-[350px] overflow-y-auto'>
					{filteredCurrencies.length > 0 ? (
						<div className='space-y-4'>
							{filteredCurrencies.map(currency => (
								<div
									key={currency.currencyCode}
									className='flex items-center space-x-2'
								>
									<Checkbox
										id={currency.currencyCode}
										checked={userCurrencies.has(currency.currencyCode)}
										onCheckedChange={checked =>
											handleAccessChange(currency.currencyCode, !!checked)
										}
									/>
									<label
										htmlFor={currency.currencyCode}
										className='text-sm font-medium leading-none'
									>
										{currency.currencyCode}
									</label>
								</div>
							))}
						</div>
					) : (
						<div className='flex items-center justify-center h-full'>
							<p className='text-sm text-muted-foreground'>
								No currencies found.
							</p>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	)
}
