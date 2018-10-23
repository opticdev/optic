export const confirmText = ({isValid, value, errors}) => {
if (isValid) {
return `
{bold}Valid Model{/bold}
`
} else {

return `
{bold}Invalid Model{/bold}
${errors.map((e, index) => `${index + 1}) ${e.dataPath} ${e.message}`).join('\n')}
`
}

}
