export const statusText = (status) => {
	if (status.isLoading) {
		return 'Building Skills...'
	} else if (status.hasErrors) {
		return '{red-fg}Error building skills. Press {bold}e{/bold} to view{/red-fg}'
	}
}

export const shouldShowStatus = (status) => !!status && (status.isLoading || status.hasErrors)
