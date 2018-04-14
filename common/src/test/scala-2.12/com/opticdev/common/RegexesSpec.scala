package com.opticdev.common

import org.scalatest.FunSpec

class RegexesSpec extends FunSpec {

  describe("namespaces") {
    def test(string: String): Boolean = string.matches(Regexes.namespace)

    it("matches valid namespaces") {
      assert(test("optic"))
      assert(test("test"))
      assert(test("mycompany"))
    }
    it("rejects invalid namespaces") {
      assert(!test("ab"))
      assert(!test("1force"))
      assert(!test("hello-company"))
      assert(!test("  fdsfjhk   jhksdhjf"))
    }
  }

  describe("package names") {
    def test(string: String): Boolean = string.matches(Regexes.packageName)

    it("matches valid namespaces") {
      assert(test("package"))
      assert(test("package12"))
      assert(test("package-name"))
    }
    it("rejects invalid namespaces") {
      assert(!test("f1"))
      assert(!test("1fforce"))
      assert(!test("hello - company"))
      assert(!test("fdsfjhk_jhksdhjf"))
    }
  }

  describe("package ids") {
    def test(string: String): Boolean = string.matches(Regexes.packageId)

    it("matches valid packageId") {
      assert(test("package:other"))
      assert(test("package12:other2"))
      assert(test("package12:package-other"))
    }
    it("rejects invalid packageId") {
      assert(!test("f 1"))
      assert(!test("1f #force"))
      assert(!test("hello - company"))
      assert(!test("fds fjhk_jhksdhjf"))
    }
  }

}
