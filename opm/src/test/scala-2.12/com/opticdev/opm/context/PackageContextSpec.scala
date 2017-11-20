package com.opticdev.opm.context

import com.opticdev.common.PackageRef
import com.opticdev.opm.{PackageManager, TestPackageProviders}
import com.opticdev.sdk.descriptions
import com.opticdev.sdk.descriptions.Schema
import org.scalatest.FunSpec

class PackageContextSpec extends FunSpec with TestPackageProviders {

  describe("Package Context") {

    describe("within dependencies trees") {
      val treeContext = PackageManager.collectPackages(Seq(t.opticExpress.packageRef, t.a.packageRef)).get.treeContext

      it("can resolve a property from a dependency") {
        val propertyOption = treeContext("optic:express-js@0.1.0").get("optic:rest/parameter")
        assert(propertyOption.get.asInstanceOf[Schema].name == "Parameter")
      }

      it("can resolve a property within self") {
        val propertyOption = treeContext("optic:rest@0.1.0").get("parameter")
        assert(propertyOption.isDefined)
      }

      it("will not resolve a dependency of another package") {
        assert(treeContext("optic:express-js@0.1.0").get.getPackageContext("optic:c").isEmpty)
      }

      it("will return None if lookup path is invalid") {
          assert(treeContext("optic:express-js@0.1.0").get.getDependencyProperty("optic:rest  :) parameter").isEmpty)
      }



    }




  }

}
