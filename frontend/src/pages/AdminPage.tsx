import { useEffect, useState } from 'react'
import axiosInstance from '@/api/axiosInstance'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ManageCurrenciesDialog } from '@/components/custom/ManageCurrenciesDialog'

interface User {
	id: number
	name: string
	email: string
	role: string
}

export function AdminPage() {
	const [users, setUsers] = useState<User[]>([])

	// Состояния для управления диалоговым окном
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [selectedUser, setSelectedUser] = useState<User | null>(null)

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const response = await axiosInstance.get('/api/admin/users')
				setUsers(response.data)
			} catch (error) {
				console.error('Failed to fetch users:', error)
			}
		}
		fetchUsers()
	}, [])

    const handleManageClick = (user: User) => {
			setSelectedUser(user)
			setIsDialogOpen(true)
		}

	return (
		<>
			<div className='container mx-auto py-10'>
				<h1 className='text-3xl font-bold mb-6'>User Management</h1>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>ID</TableHead>
							<TableHead>Name</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Role</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{users.map(user => (
							<TableRow key={user.id}>
								<TableCell>{user.id}</TableCell>
								<TableCell>{user.name}</TableCell>
								<TableCell>{user.email}</TableCell>
								<TableCell>{user.role}</TableCell>
								<TableCell>
									<Button
										variant='outline'
										onClick={() => handleManageClick(user)}
									>
										Manage Currencies
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
			<ManageCurrenciesDialog
				user={selectedUser}
				isOpen={isDialogOpen}
				onOpenChange={setIsDialogOpen}
			/>
		</>
	)
}
