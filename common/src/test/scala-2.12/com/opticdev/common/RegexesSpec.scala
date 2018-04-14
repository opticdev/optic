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

}
