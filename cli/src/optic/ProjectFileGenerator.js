export function projectFileGenerator(name, skills) {
const projectFile = `
name: ${name}
parsers:
  - es7

skills:
${(() => {
	return skills
		.filter((i) => presets.hasOwnProperty(i))
		.map((i) => `  - ${presets[i]}`)
		.join("\n")
})()}

`.trim()

	return projectFile
}


const presets = {
	'express': 'optic:express@0.4.1',
	'request': 'optic:request-js@0.4.0',
	'rest': 'optic:rest@0.4.0'
}
