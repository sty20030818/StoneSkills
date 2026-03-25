import React from 'react'
import type { ReactNode } from 'react'
import { normalizeCommandError } from '@/lib/tauri/errors'
import type { CommandError } from '@/lib/tauri/contracts'
import { ErrorState } from '@/components/shared/ErrorState'

interface State {
	error: CommandError | null
}

export class AppErrorBoundary extends React.Component<{ children: ReactNode }, State> {
	public override state: State = {
		error: null,
	}

	public static getDerivedStateFromError(error: unknown): State {
		return {
			error: normalizeCommandError(error),
		}
	}

	public override render() {
		if (this.state.error) {
			return (
				<div className='min-h-screen bg-background p-6'>
					<ErrorState error={this.state.error} />
				</div>
			)
		}

		return this.props.children
	}
}
