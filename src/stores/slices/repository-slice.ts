import type { RepositoryStatus } from '@/lib/tauri/contracts'

export interface RepositorySlice {
	repositoryRoot: string | null
	suggestedRepositoryRoot: string | null
	repositoryHealthStatus: RepositoryStatus['status'] | null
	repositoryMissingDirectories: string[]
	repositoryWritable: boolean | null
	repositoryMessage: string | null
	setRepositoryRoots: (value: { repositoryRoot: string | null; suggestedRepositoryRoot: string | null }) => void
	setRepositoryStatus: (value: RepositoryStatus | null) => void
}

export const createRepositorySlice = (set: SetStore<RepositorySlice>) => ({
	repositoryRoot: null as string | null,
	suggestedRepositoryRoot: null as string | null,
	repositoryHealthStatus: null as RepositoryStatus['status'] | null,
	repositoryMissingDirectories: [] as string[],
	repositoryWritable: null as boolean | null,
	repositoryMessage: null as string | null,
	setRepositoryRoots: (value: { repositoryRoot: string | null; suggestedRepositoryRoot: string | null }) =>
		set({
			repositoryRoot: value.repositoryRoot,
			suggestedRepositoryRoot: value.suggestedRepositoryRoot,
		}),
	setRepositoryStatus: (value: RepositoryStatus | null) =>
		set({
			repositoryRoot: value?.rootPath ?? null,
			repositoryHealthStatus: value?.status ?? null,
			repositoryMissingDirectories: value?.missingDirectories ?? [],
			repositoryWritable: value?.writable ?? null,
			repositoryMessage: value?.message ?? null,
		}),
})
