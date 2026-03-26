'use client'

import type { CSSProperties } from 'react'
import { useEffect, useRef } from 'react'
import { BadgeAlertIcon } from '@/components/ui/badge-alert'
import { CircleCheckIcon } from '@/components/ui/circle-check'
import { CircleHelpIcon } from '@/components/ui/circle-help'
import { LoaderPinwheelIcon, type LoaderPinwheelIconHandle } from '@/components/ui/loader-pinwheel'
import { XIcon } from '@/components/ui/x'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

function ToastLoadingIcon() {
	const loaderRef = useRef<LoaderPinwheelIconHandle>(null)

	useEffect(() => {
		const loader = loaderRef.current

		loader?.startAnimation()

		return () => {
			loader?.stopAnimation()
		}
	}, [])

	return (
		<LoaderPinwheelIcon
			ref={loaderRef}
			size={16}
			className='inline-flex items-center justify-center'
		/>
	)
}

const Toaster = ({ ...props }: ToasterProps) => {
	return (
		<Sonner
			theme='light'
			className='toaster group'
			icons={{
				success: (
					<CircleCheckIcon
						size={16}
						className='inline-flex items-center justify-center'
					/>
				),
				info: (
					<CircleHelpIcon
						size={16}
						className='inline-flex items-center justify-center'
					/>
				),
				warning: (
					<BadgeAlertIcon
						size={16}
						className='inline-flex items-center justify-center'
					/>
				),
				error: (
					<XIcon
						size={16}
						className='inline-flex items-center justify-center'
					/>
				),
				loading: <ToastLoadingIcon />,
			}}
			style={
				{
					'--normal-bg': 'var(--popover)',
					'--normal-text': 'var(--popover-foreground)',
					'--normal-border': 'var(--border)',
					'--border-radius': 'var(--radius)',
					'--success-bg': 'var(--state-success-bg)',
					'--success-text': 'var(--state-success-fg)',
					'--success-border': 'var(--state-success-border)',
					'--warning-bg': 'var(--state-warning-bg)',
					'--warning-text': 'var(--state-warning-fg)',
					'--warning-border': 'var(--state-warning-border)',
					'--error-bg': 'var(--state-error-bg)',
					'--error-text': 'var(--state-error-fg)',
					'--error-border': 'var(--state-error-border)',
					'--info-bg': 'var(--state-info-bg)',
					'--info-text': 'var(--state-info-fg)',
					'--info-border': 'var(--state-info-border)',
				} as CSSProperties
			}
			toastOptions={{
				classNames: {
					toast: 'cn-toast',
				},
			}}
			{...props}
		/>
	)
}

export { Toaster }
