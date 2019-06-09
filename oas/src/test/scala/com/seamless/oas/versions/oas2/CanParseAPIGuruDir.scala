package com.seamless.oas.versions.oas2

import com.seamless.oas.api_guru_interface.questions.{OAS2SpecsThatCantBeParsed, OAS3SpecsThatCantBeParsed}
import org.scalatest.FunSpec

class CanParseAPIGuruDir extends FunSpec {

  it("All oas 2 parse") {
    assert(OAS2SpecsThatCantBeParsed.run.failures == 0)
  }

  it("All oas 3 parse") {
    assert(OAS3SpecsThatCantBeParsed.run.failures == 0)
  }

}
