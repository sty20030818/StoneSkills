import { LoaderPinwheelIcon } from '@/components/ui/loader-pinwheel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface GithubImportEntryProps {
	value: string
	loading: boolean
	onChange: (value: string) => void
	onSubmit: () => void
}

export function GithubImportEntry({ value, loading, onChange, onSubmit }: GithubImportEntryProps) {
	return (
		<div className='grid gap-4'>
			<div className='grid gap-2'>
				<h2 className='text-lg font-semibold tracking-[-0.03em] text-foreground'>Git 仓库地址</h2>
				<div
					data-testid='install-github-input-row'
					className='grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3'>
					<label className='grid gap-2 text-sm'>
						<span className='sr-only'>Git 仓库地址</span>
						<Input
							value={value}
							onChange={(event) => onChange(event.target.value)}
							placeholder='https://github.com/user/repo 或 user/repo'
						/>
					</label>
					<Button
						type='button'
						className='min-w-28'
						disabled={loading || value.trim().length === 0}
						onClick={onSubmit}>
						{loading ? (
							<>
								<LoaderPinwheelIcon
									data-testid='github-inspect-loader'
									className='animate-spin text-current'
									size={16}
								/>
								<span>识别中...</span>
							</>
						) : (
							'识别仓库'
						)}
					</Button>
				</div>
			</div>
			<div className='grid gap-2 text-sm leading-6 text-muted-foreground'>
				<p className='font-medium text-foreground'>支持格式：</p>
				<ul className='grid gap-1 pl-5'>
					<li className='list-disc'>https://github.com/user/repo 或直接写 user/repo</li>
					<li className='list-disc'>https://github.com/user/repo/tree/main/skills/my-skill（指定子路径）</li>
				</ul>
			</div>
		</div>
	)
}
