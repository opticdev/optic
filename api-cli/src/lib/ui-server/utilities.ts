import * as Express from 'express'
import * as path from 'path'
class Utilities {
    static addUiServer(app: Express.Application) {
        const resourceRoot = path.resolve(__dirname, '../../../resources');
        const reactRoot = path.join(resourceRoot, 'react');
        const indexHtmlPath = path.join(reactRoot, 'index.html')
        app.use(Express.static(reactRoot))
        app.get('*', (req, res) => {
            res.sendFile(indexHtmlPath)
        })
    }
}

export {
    Utilities
}