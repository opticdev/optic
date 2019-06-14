package com.seamless.oas.versions.oas2

import com.seamless.oas.api_guru_interface.questions.{OAS2SpecsThatCantBeParsed, OAS3SpecsThatCantBeParsed}
import org.scalatest.FunSpec

class CanParseAPIGuruDir extends FunSpec {

  it("All oas 2 parse") {
    val result = OAS2SpecsThatCantBeParsed.run

    if (result.failuresCount != 0) {
      result.failures.head.tryResult.failed.get.printStackTrace()
      println(result.failures.map(_.apiName).mkString("\n"))
    }

    assert(result.failuresCount == 0)
  }

  it("All oas 3 parse") {
    assert(OAS3SpecsThatCantBeParsed.run.failuresCount == 0)
  }

}
