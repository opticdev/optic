package com.opticdev.core.sourcegear.token_value

import akka.actor.ActorSystem
import better.files.File
import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.Fixture.compilerUtils.GearUtils
import com.opticdev.core.sourcegear.actors.ActorCluster
import com.opticdev.core.sourcegear.project.StaticSGProject

class FileTokenRegistrySpec extends TestBase with GearUtils {

  def fileTokenRegistryForFile(filePath: String): FileTokenRegistry = {
    val file = File(filePath)
    implicit val actorCluster: ActorCluster = new ActorCluster(ActorSystem())
    implicit val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/"), sourceGear)
    val results = sourceGear.parseFile(file).get

    lazy val syncTestSourceGear = sourceGearFromDescription("test-examples/resources/example_packages/synctest.json")
    syncTestSourceGear.parseFile(file).get.fileTokenRegistry
  }

  it("finds tokens in registry") {
    val registry = fileTokenRegistryForFile("test-examples/resources/example_source/token_value/example.js")

    val external = registry.entries.collect { case a if a.isExternal => a }

    val internal = registry.entries.collect { case a if a.isInternal => a }

    assert(external.size == 1 && external.map(_.key) == Set("externalOne"))
    assert(internal.size == 2 && internal.map(_.key) == Set("hello", "goodbye"))

  }
}
