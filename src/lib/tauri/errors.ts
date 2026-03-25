import type { CommandError } from '@/lib/tauri/contracts'

export class TauriCommandError extends Error {
	public readonly payload: CommandError

	public constructor(payload: CommandError) {
		super(payload.message)
		this.name = 'TauriCommandError'
		this.payload = payload
	}
}

export function normalizeCommandError(error: unknown): CommandError {
	if (typeof error === 'object' && error !== null && 'code' in error && 'message' in error) {
		return error as CommandError
	}

	if (error instanceof Error) {
		return {
			code: 'frontend/unexpected-error',
			message: error.message,
			details: error.stack,
			recoverable: true,
		}
	}

	return {
		code: 'frontend/unknown',
		message: '发生未知前端错误',
		details: String(error),
		recoverable: true,
	}
}
