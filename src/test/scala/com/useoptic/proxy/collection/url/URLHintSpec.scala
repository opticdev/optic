package com.useoptic.proxy.collection.url

import org.scalatest.FunSpec

class URLHintSpec extends FunSpec {

  describe("single, basic parameter") {
    it("will match valid route") {
      val result = TestHints.userById.matches("/users/me/")
      assert(result.isDefined)
      assert(result.get == Map("userId" -> "me"))
    }

    it("will not match other routes") {
      assert(TestHints.userById.matches("/users").isEmpty)
      assert(TestHints.userById.matches("/login").isEmpty)
      assert(TestHints.userById.matches("/abc").isEmpty)
      assert(TestHints.userById.matches("/users/me/a").isEmpty)
      assert(TestHints.userById.matches("/users/me/me").isEmpty)
    }

  }

  describe("single parameter, between static components") {
    it("will match valid route") {
      val result = TestHints.userProfileById.matches("/users/abc/profile")
      assert(result.isDefined)
      assert(result.get == Map("userId" -> "abc"))
    }

    it("will not match other routes") {
      assert(TestHints.userById.matches("/users").isEmpty)
      assert(TestHints.userById.matches("/login").isEmpty)
      assert(TestHints.userById.matches("/abc").isEmpty)
      assert(TestHints.userById.matches("/users/me/a").isEmpty)
      assert(TestHints.userById.matches("/users/me/me").isEmpty)
    }

  }

  describe("two parameters is same section") {
    it("will match valid route") {
      val result = TestHints.interActionsByUser.matches("/interactions/opticA-opticB")
      assert(result.isDefined)
      assert(result.get == Map("personA" -> "opticA", "personB" -> "opticB"))
    }

    it("will not match other routes") {
      assert(TestHints.userById.matches("/interactions/opticA-opticB/DUDE").isEmpty)
      assert(TestHints.userById.matches("/interactions/clueless").isEmpty)
    }

  }

}
