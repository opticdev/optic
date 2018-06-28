package com.opticdev.core.trainer

import org.scalatest.FunSpec

class TrainerAppServicesSpec extends FunSpec {

  it("can list all markdown files for project") {
    val results = TrainerAppServices.listAllProjects(Seq("test-examples/optic.yml"))

    assert(results.size == 1)
    assert(results.head.mdFiles.size == 4)
  }

}
