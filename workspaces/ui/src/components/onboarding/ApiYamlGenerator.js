

export const  ApiYamlGenerator = (name, command, baseUrl) => {
return`
name: ${name}
tasks:
  start:
    command: ${command}
    baseUrl: ${baseUrl}
`.trim()
}
