export const Frameworks = []

function addFramework(name, language, generateCommand, requireCodeUpdate) {
  return Frameworks.push({name, language, generateCommand, requireCodeUpdate})
}

addFramework('Express JS', 'Node', () => `echo 'Add your Node Start Command in optic.yml'`,
`// before
app.listen(process.env.PORT || 3000)
// after
app.listen(process.env.OPTIC_API_PORT || process.env.PORT || 3000)`)

addFramework('Rails', 'Ruby', () => `rails server -p $OPTIC_PROXY_PORT`)
addFramework('Laravel', 'PHP', () => `php artisan serve --port=$OPTIC_PROXY_PORT`)
addFramework('CodeIgniter', 'PHP', () => `php spark serve --port=$OPTIC_PROXY_PORT`)
addFramework('Flask', 'Python', () => `flask run --host=0.0.0.0 --port=$OPTIC_PROXY_PORT`)
addFramework('Play', 'Scala', () => `sbt "run -Dhttp.port=$OPTIC_PROXY_PORT"`)
addFramework('Zeit Now', 'Other', () => `now dev --listen $OPTIC_PROXY_PORT`)







export const FrameworkLanguageOrder = ['Node', 'Ruby', 'PHP', 'Scala', 'Other']
