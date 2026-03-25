export interface RepositorySlice {
  repositoryRoot: string | null;
  suggestedRepositoryRoot: string | null;
  setRepositoryRoots: (value: {
    repositoryRoot: string | null;
    suggestedRepositoryRoot: string | null;
  }) => void;
}

export const createRepositorySlice = (set: SetStore<RepositorySlice>) => ({
  repositoryRoot: null as string | null,
  suggestedRepositoryRoot: null as string | null,
  setRepositoryRoots: (value: {
    repositoryRoot: string | null;
    suggestedRepositoryRoot: string | null;
  }) =>
    set({
      repositoryRoot: value.repositoryRoot,
      suggestedRepositoryRoot: value.suggestedRepositoryRoot,
    }),
});
