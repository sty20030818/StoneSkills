import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { GithubImportPreviewPanel } from '@/pages/install/components/GithubImportPreviewPanel'

describe('GithubImportPreviewPanel', () => {
	it('会高亮技能数量，并阻止禁用候选项进入选择流程', () => {
		const handleToggleCandidate = vi.fn()

		render(
			<GithubImportPreviewPanel
				githubUrl='https://github.com/example/skills'
				candidates={[
					{
						relativePath: '',
						slug: 'skill-alpha',
						name: 'Skill Alpha',
						description: 'Alpha 描述',
						author: 'Stone',
						version: '1.0.0',
						readmePath: '/tmp/README.md',
						missingFields: [],
						conflicts: [],
					},
					{
						relativePath: 'skills/broken',
						slug: 'broken-skill',
						name: 'Broken Skill',
						description: null,
						author: 'Stone',
						version: '0.1.0',
						readmePath: null,
						missingFields: ['description'],
						conflicts: ['slug 冲突：broken-skill'],
					},
				]}
				selectedKeys={['skill-alpha']}
				installingMode={null}
				onToggleCandidate={handleToggleCandidate}
				onClearSelection={vi.fn()}
				onInstallSelected={vi.fn()}
				onInstallAll={vi.fn()}
				onViewDetails={vi.fn()}
			/>,
		)

		expect(screen.getByText('识别到 2 个技能')).toBeInTheDocument()
		expect(screen.getByText('2')).toHaveClass('text-primary')
		expect(screen.queryByText('来源：https://github.com/example/skills')).not.toBeInTheDocument()
		expect(screen.getByText('不可安装：缺失字段 description；slug 冲突：broken-skill')).toBeInTheDocument()
		expect(screen.getByRole('button', { name: '安装选中' })).not.toBeDisabled()
		expect(screen.getByTestId('github-import-preview-root')).toHaveClass('min-h-0')
		expect(screen.getByTestId('github-import-preview-root')).toHaveClass('h-full')
		expect(screen.getByTestId('github-import-preview-summary')).toHaveClass('shrink-0')
		expect(screen.getByTestId('github-import-preview-list-card')).toHaveClass('flex-1')
		expect(screen.getByTestId('github-import-preview-list-card')).toHaveClass('min-h-0')
		expect(screen.getByTestId('github-import-preview-list-shell')).toHaveClass('overflow-y-auto')
		expect(screen.getByTestId('github-import-preview-list-shell')).toHaveClass('min-h-0')
		expect(screen.getByTestId('github-import-preview-actions')).toHaveClass('shrink-0')
		expect(screen.getByTestId('github-import-preview-actions')).not.toHaveClass('border-t')
		expect(screen.getByTestId('github-import-selection-indicator-skill-alpha')).toHaveClass('bg-primary')
		expect(screen.getByTestId('github-import-selection-check-skill-alpha')).toHaveClass('text-white')

		fireEvent.click(screen.getByTestId('github-import-candidate-card-skill-alpha'))
		expect(handleToggleCandidate).toHaveBeenCalledTimes(1)

		fireEvent.click(screen.getByTestId('github-import-candidate-card-skills/broken'))
		expect(handleToggleCandidate).toHaveBeenCalledTimes(1)
	})
})
