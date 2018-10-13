package com.opticdev.cli.binder

import sys.process._
import org.scalatest.FunSpec

class BindCLISpec extends FunSpec {

  val omd = "/Users/aidancunniffe/Developer/knack/optic-core/server/src/main/resources/opticmarkdown"
  System.setProperty("opticmdbinary", omd)

  it("can bind a jar") {
    BindCLI.toNativeBash(null)
    assert("which optic".!! == "/usr/local/bin/optic\n")
    assert("optic".!! == "Hello World\n")
  }

}
