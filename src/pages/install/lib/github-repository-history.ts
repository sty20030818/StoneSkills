const GITHUB_ROOT_URL = 'https://github.com'
const HISTORY_LIMIT = 10

const githubTreePattern = /^https:\/\/github\.com\/([^/\s]+)\/([^/\s]+?)(?:\.git)?\/tree\/([^/\s]+)\/(.+)$/i
const githubRootPattern = /^https:\/\/github\.com\/([^/\s]+)\/([^/\s]+?)(?:\.git)?\/?$/i
const githubShorthandPattern = /^([^/\s]+)\/([^/\s]+?)$/

function trimTrailingSlashes(value: string) {
	return value.replace(/\/+$/, '')
}

export function normalizeGithubRepositoryHistoryEntry(value: string) {
	const trimmed = value.trim()

	if (trimmed.length === 0) {
		return ''
	}

	const treeMatch = trimmed.match(githubTreePattern)
	if (treeMatch) {
		const [, owner, repo, ref, path] = treeMatch
		return trimTrailingSlashes(`${GITHUB_ROOT_URL}/${owner}/${repo}/tree/${ref}/${path}`)
	}

	const rootMatch = trimmed.match(githubRootPattern)
	if (rootMatch) {
		const [, owner, repo] = rootMatch
		return `${GITHUB_ROOT_URL}/${owner}/${repo}`
	}

	const shorthandMatch = trimmed.match(githubShorthandPattern)
	if (shorthandMatch) {
		const [, owner, repo] = shorthandMatch
		return `${GITHUB_ROOT_URL}/${owner}/${repo}`
	}

	return trimTrailingSlashes(trimmed)
}

export function mergeRecentGithubRepositories(current: string[], nextValue: string) {
	const normalizedNextValue = normalizeGithubRepositoryHistoryEntry(nextValue)

	if (normalizedNextValue.length === 0) {
		return current
	}

	return [normalizedNextValue, ...current.filter((item) => normalizeGithubRepositoryHistoryEntry(item) !== normalizedNextValue)].slice(0, HISTORY_LIMIT)
}
