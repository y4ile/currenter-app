import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'

interface Currency {
	currencyCode: string
	rate: number
}

interface CurrencyComboBoxProps {
	currencies: Currency[]
	value: string
	onValueChange: (value: string) => void
	placeholder?: string
}

export function CurrencyComboBox({
	currencies,
	value,
	onValueChange,
	placeholder,
}: CurrencyComboBoxProps) {
	const [open, setOpen] = React.useState(false)

	const selectedCurrency = currencies.find(
		currency => currency.currencyCode.toLowerCase() === value.toLowerCase()
	)

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant='outline'
					role='combobox'
					aria-expanded={open}
					className='w-full justify-between'
				>
					{value
						? selectedCurrency?.currencyCode
						: placeholder || 'Select currency...'}
					<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
				</Button>
			</PopoverTrigger>
			<PopoverContent className='w-[200px] p-0'>
				<Command>
					<CommandInput placeholder='Search currency...' />
					<CommandList>
						<CommandEmpty>No currency found.</CommandEmpty>
						<CommandGroup>
							{currencies.map(currency => (
								<CommandItem
									key={currency.currencyCode}
									value={currency.currencyCode}
									onSelect={currentValue => {
										onValueChange(
											currentValue.toUpperCase() === value
												? ''
												: currentValue.toUpperCase()
										)
										setOpen(false)
									}}
								>
									<Check
										className={cn(
											'mr-2 h-4 w-4',
											value === currency.currencyCode
												? 'opacity-100'
												: 'opacity-0'
										)}
									/>
									{currency.currencyCode}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	)
}
