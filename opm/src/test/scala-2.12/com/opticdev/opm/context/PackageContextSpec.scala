package com.opticdev.opm.context

import com.opticdev.common.PackageRef
import com.opticdev.opm.{PackageManager, TestPackageProviders}
import com.opticdev.sdk.descriptions
import com.opticdev.sdk.descriptions.Schema
import org.scalatest.FunSpec

class PackageContextSpec extends FunSpec with TestPackageProviders {

  describe("Package Context") {

    describe("within dependencies trees") {
      val treeContext = PackageManager.collectPackages(Seq(t.opticExpress.packageRef)).get.treeContext

      it("can resolve a property from a dependency") {
        val propertyOption = treeContext("optic:express-js@0.1.0").get.getDependencyProperty("optic:rest/parameter")
        assert(propertyOption.get.asInstanceOf[Schema].name == "Parameter")
      }

      it("will not resolve a dependency of another package") {}

      it("will throw error if lookup path is invalid") {
        assertThrows[Error] {
          treeContext("optic:express-js@0.1.0").get.getDependencyProperty("optic:rest  :) parameter")
        }
      }



    }




  }

}
