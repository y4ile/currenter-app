import { useAuth } from '@/context/AuthContext'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Coins } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Header() {
	const { user, logout, role } = useAuth()

	// Получаем инициалы из email, если имя недоступно
	const getInitials = () => {
		if (!user || !user.email) return '?'
		return user.email.substring(0, 2).toUpperCase()
	}

	return (
		<header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
			<div className='pl-16 pr-16 flex h-14 justify-between'>
				<div className='mr-4 flex items-center'>
					<Coins className='h-6 w-6 mr-2' />
					<a href='/' className='font-bold'>
						Currenter
					</a>
				</div>
				<div className='flex flex-1 items-center justify-end space-x-4'>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant='ghost' className='relative h-8 w-8 rounded-full'>
								<Avatar className='h-8 w-8'>
									<AvatarFallback>{getInitials()}</AvatarFallback>
								</Avatar>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className='w-56' align='end' forceMount>
							<DropdownMenuLabel className='font-normal'>
								<div className='flex flex-col space-y-1'>
									<p className='text-sm font-medium leading-none'>My Account</p>
									<p className='text-xs leading-none text-muted-foreground'>
										{user?.email}
									</p>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							{role === 'Admin' && (
								<DropdownMenuItem asChild>
									<Link to='/admin'>Admin Panel</Link>
								</DropdownMenuItem>
							)}
							<DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	)
}
