package com.opticdev.core.sourcegear

import better.files.File
import com.opticdev.core.sourcegear.project.config.ProjectFile
import com.opticdev.sdk.descriptions.{Schema, SchemaColdStorage}
import org.scalatest.FunSpec
import play.api.libs.json.{JsObject, Json}
import boopickle.Default._
import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.sourcegear.gears.RuleProvider
import com.opticdev.core.sourcegear.gears.generating.GenerateGear
import com.opticdev.core.sourcegear.gears.parsing.ParseAsModel
import com.opticdev.core.sourcegear.serialization.PickleImplicits._
import com.opticdev.core.storage.stores.GearStorage
import com.opticdev.opm.TestPackageProviders
import com.opticdev.parsers.graph.AstType
class SGConfigSpec extends TestBase with TestPackageProviders {

  describe("SG Config") {

    it("can be pickled") {

      val sgConfig = SGConstructor.fromProjectFile(new ProjectFile(File("test-examples/resources/example_packages/express/optic.yaml")))
        .get

      val picked = Pickle.intoBytes(sgConfig)
      val unpickled = Unpickle[SGConfig].fromBytes(picked)

      assert(unpickled == sgConfig)

    }

  }

}
