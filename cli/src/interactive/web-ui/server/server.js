import express from 'express';
import path from 'path';
import opn from 'opn'
import {json as jsonBodyParser} from 'body-parser'

let currentServer = null

export function startServer(withPatch, applyCallback) {

	const open = () => opn('http://localhost:30332/');

	if (currentServer) {
		open()
		return
	}

	const app = express();

	app.use(jsonBodyParser())

	app.use(express.static( path.resolve( './react-diff-view' ) ) );

	app.get( "/get-patch", ( req, res ) => {
		res.json(withPatch)
	})

	app.post( "/apply-patch", ( req, res ) => {
		if (applyCallback) {
			applyCallback(req.body)
		}
		res.send('Done')
	})


	currentServer = app.listen( 30332, () => {
		open()
	});
}

export function stopServer() {
	if (currentServer) {
		currentServer.close(() => {
			currentServer = null
		})
	}
}
