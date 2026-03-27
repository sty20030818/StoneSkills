import type { PropsWithChildren } from 'react'

export function MainIsland({ children }: PropsWithChildren) {
	return (
		<section
			data-testid='app-main-island'
			className='min-h-0 min-w-0'>
			{children}
		</section>
	)
}
