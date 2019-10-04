const { is } = require('type-is')
const querystring = require('querystring')

//@TODO: make this pluggable by the end user
const jsonTypes = [ 'json', 'application/*+json' ];
const formTypes = [ 'urlencoded' ];

class BodyParser {
    parse(contentType, bodyText, bodyEncoding) {
        if (is(contentType, jsonTypes)) {
            if (bodyText === '') {
                return undefined
            }
            return JSON.parse(bodyText)
        }

        if (is(contentType, formTypes)) {
            return querystring.parse(bodyText)
        }

        return bodyText

        // const e = new Error(`unhandled contentType ${contentType}`)
        // console.error(e)
        // throw e
    }
}

export {
    BodyParser
}