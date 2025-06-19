import { Line, LineChart, ResponsiveContainer, YAxis } from 'recharts'

// Данные-заглушка. В будущем здесь будут реальные исторические данные.
const data = [
	{ value: 480 },
	{ value: 490 },
	{ value: 510 },
	{ value: 470 },
	{ value: 520 },
	{ value: 540 },
	{ value: 560 },
	{ value: 530 },
	{ value: 580 },
	{ value: 600 },
]

export function CurrencyChart() {
	return (
		<div className='h-[120px]'>
			<ResponsiveContainer width='100%' height='100%'>
				<LineChart
					data={data}
					margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
				>
					<YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
					<Line
						type='monotone'
						strokeWidth={2}
						dataKey='value'
						stroke='hsl(var(--primary))'
						dot={false}
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	)
}
