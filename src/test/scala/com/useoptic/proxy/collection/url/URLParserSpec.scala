package com.useoptic.proxy.collection.url

import org.scalatest.FunSpec

class URLParserSpec extends FunSpec {

  it("can find match") {
    val either = URLParser.parse("http://me.com/users/meabc123", Vector(TestHints.userById))
    val urlResult = either.right.get
    assert(urlResult.raw == "/users/:userId")
  }

  it("will fail if ambiguous") {
    val either = URLParser.parse("http://me.com/users/meabc123", Vector(TestHints.userById, TestHints.userById))
    val exception = either.left.get
    assert(exception.getMessage == "Multiple path entries (/users/:userId || /users/:userId) satisfy observed url:  'users/meabc123'")
  }

  it("will fail if no match found") {
    val either = URLParser.parse("http://me.com/url/none", Vector(TestHints.userById))
    val exception = either.left.get
    assert(exception.getMessage == "No Path found in 'optic.yaml' for observed:  'url/none'")
  }

}
