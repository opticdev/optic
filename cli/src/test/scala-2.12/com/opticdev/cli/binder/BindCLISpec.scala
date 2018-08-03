package com.opticdev.cli.binder

import sys.process._
import org.scalatest.FunSpec

class BindCLISpec extends FunSpec {

  it("test") {
    BindCLI.toNativeBash
    assert("which optic".!! == "/usr/local/bin/optic\n")
  }

}
