import * as assert from 'assert'
// @ts-ignore
import * as equals from 'deep-equal'
import {allowedMethods, parseRule} from '../src/lib/ignore-parser'

describe('Ignore rule parser', () => {

  it('can parse a basic ignore rule', () => {
    const rule = parseRule('GET /index.html')
    assert(equals(rule!.methods, ['GET']))
    assert(rule!.shouldIgnore('GET', '/index.html'))
    assert(!rule!.shouldIgnore('POST', '/index.html'))
    assert(!rule!.shouldIgnore('POST', '/users/pets'))
  })

  it('can parse a rule that ignores all options', () => {
    const rule = parseRule('OPTIONS *')
    assert(equals(rule!.methods, ['OPTIONS']))
    assert(rule!.shouldIgnore('OPTIONS', '/index.html'))
    assert(rule!.shouldIgnore('OPTIONS', '/users/me'))
    assert(!rule!.shouldIgnore('POST', '/index.html'))
  })

  it('can parse a rule that ignores HEAD and OPTIONS to a route', () => {
    const rule = parseRule('HEAD OPTIONS /login')
    assert(equals(rule!.methods, ['HEAD', 'OPTIONS']))
    assert(rule!.shouldIgnore('OPTIONS', '/login'))
    assert(rule!.shouldIgnore('HEAD', '/login'))
    assert(!rule!.shouldIgnore('POST', '/index.html'))
  })

  it('can parse a rule that ignores all GET of html', () => {
    const rule = parseRule('GET *.html')
    assert(equals(rule!.methods, ['GET']))
    assert(rule!.shouldIgnore('GET', '/index.html'))
    assert(rule!.shouldIgnore('GET', '/public/web/pages/me.html'))
    assert(!rule!.shouldIgnore('POST', '/transactions'))
  })

  it('ignores everything', () => {
    const rule = parseRule('*')
    assert(equals(rule!.methods, allowedMethods))
    assert(rule!.shouldIgnore('GET', '/index.html'))
    assert(rule!.shouldIgnore('PUT', '/public/web/pages/me.html'))
    assert(rule!.shouldIgnore('POST', '/'))
  })

  it('can parse a rule with a path parameter', () => {
    const rule = parseRule('POST /users/:userId')
    assert(equals(rule!.methods, ['POST']))
    assert(rule!.shouldIgnore('POST', '/users/12334'))
    assert(rule!.shouldIgnore('POST', '/users/abc'))
  })

  it('fails gracefully if you use a random method', () => {
    const rule = parseRule('POST PuuT /users/:userId')
    assert(equals(rule!.methods, ['POST']))
    assert(rule!.shouldIgnore('POST', '/users/12334'))
  })

  it('is undefined for empty string', () => {
    const rule = parseRule('')
    assert(!rule)
  })

})
