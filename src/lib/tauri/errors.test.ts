import { describe, expect, it } from 'vitest'
import { normalizeCommandError } from '@/lib/tauri/errors'

describe('normalizeCommandError', () => {
	it('会保留结构化命令错误', () => {
		const payload = {
			code: 'system/io',
			message: '读取失败',
			details: 'permission denied',
			recoverable: false,
		}

		expect(normalizeCommandError(payload)).toEqual(payload)
	})

	it('会把原生 Error 转成前端错误对象', () => {
		const result = normalizeCommandError(new Error('爆炸了'))

		expect(result.code).toBe('frontend/unexpected-error')
		expect(result.message).toBe('爆炸了')
		expect(result.recoverable).toBe(true)
	})
})
