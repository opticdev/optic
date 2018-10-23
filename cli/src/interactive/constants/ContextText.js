export const contextName = (contextItem) => {
	const schemaName =  contextItem.schema.title || contextItem.schemaRef
	const givenName = !!contextItem.sync.name ? contextItem.sync.name + ' - '+schemaName : undefined
	return `{bold}${givenName || schemaName}{/bold}`
}

export const contextText = (context, contextItem) => {
return `
{bold}Found at {/bold}${context.relativeFilePath} (${contextItem.astLocation.start}, ${contextItem.astLocation.end})${transformsTo(context)}{bold}Value:{/bold}
${JSON.stringify(contextItem.value, null, 2)}

`
}

export const transformsTo = (context) => {
	if (context.results.transformations.length) {
return `
{bold}Cam Generate:{/bold}
${context.results.transformations.map((t) => ` - ${t.name}`).join('\n')}

`
	} else {
		return '\n'
	}
}


export const contextHelpText = 'Press {bold}(m){/bold} to modify \nPress {bold}(escape){/bold} to cancel'
