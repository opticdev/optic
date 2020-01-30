package com.useoptic.serialization

import org.scalatest.FunSpec

import scala.collection.immutable
import scala.util.Try

class TryChainUtilSpec extends FunSpec {

  it("will return the first successful try") {
    val funcs: immutable.Seq[String => Try[String]] = Vector(
      (a: String) => Try(if (a == "a") "1" else throw new Error("ERRRRORR")),
      (b: String) => Try(if (b == "b") "2" else throw new Error("ERRRRORR")),
      (c: String) => Try(if (c == "c") "3" else throw new Error("ERRRRORR")),
    )

    assert(TryChainUtil.firstSuccessIn("c", funcs:_*).contains("3"))
    assert(TryChainUtil.firstSuccessIn("b", funcs:_*).contains("2"))
    assert(TryChainUtil.firstSuccessIn("a", funcs:_*).contains("1"))
  }

  it("will return the first even if multiple succeed") {
    val funcs: immutable.Seq[String => Try[String]] = Vector(
      (a: String) => Try(if (a == "a") "1" else throw new Error("ERRRRORR")),
      (b: String) => Try(if (b == "a") "2" else throw new Error("ERRRRORR"))
    )

    assert(TryChainUtil.firstSuccessIn("a", funcs:_*).contains("1"))
  }

  it("will not execute things later in the chain after success") {

    var hit = false

    val funcs: immutable.Seq[String => Try[String]] = Vector(
      (a: String) => Try(if (a == "a") "1" else throw new Error("ERRRRORR")),
      (b: String) => Try({
        hit = true
        "shouldn't run"
      })
    )

    assert(TryChainUtil.firstSuccessIn("a", funcs:_*).contains("1"))
    assert(!hit)
  }



}
