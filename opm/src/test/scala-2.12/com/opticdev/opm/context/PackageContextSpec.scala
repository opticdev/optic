package com.opticdev.opm.context

import com.opticdev.common.PackageRef
import com.opticdev.opm.providers.ProjectKnowledgeSearchPaths
import com.opticdev.opm.{PackageManager, TestPackageProviders, TestProvider}
import com.opticdev.sdk.descriptions
import com.opticdev.sdk.descriptions.transformation.Transformation
import com.opticdev.sdk.descriptions.{Lens, Schema}
import org.scalatest.{BeforeAndAfter, FunSpec}

class PackageContextSpec extends FunSpec with TestPackageProviders {

  implicit val projectKnowledgeSearchPaths: ProjectKnowledgeSearchPaths = ProjectKnowledgeSearchPaths()


  describe("Package Context") {

    describe("within dependencies trees") {

      lazy val treeContext: TreeContext = PackageManager.collectPackages(Seq(t.opticExpress.packageRef, t.a.packageRef)).get.treeContext

      it("can resolve a property from a dependency") {
        val context: Option[PackageContext] = treeContext("optic:express-js@0.1.0")
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

    describe("resolves all package exportable types") {

      lazy val treeContext: TreeContext = PackageManager.collectPackages(Seq(t.opticMongoose.packageRef)).get.treeContext

      it("schema") {
        val result = treeContext("optic:mongoose@0.1.0").get("schema")
        assert(result.exists(_.isInstanceOf[Schema]))
      }

      it("lenses") {
        val result = treeContext("optic:mongoose@0.1.0").get("define-model")
        assert(result.exists(_.isInstanceOf[Lens]))
      }

      it("transformations") {
        val result = treeContext("optic:mongoose@0.1.0").get("createroutefromschema")
        assert(result.exists(_.isInstanceOf[Transformation]))
      }

    }
  }
}
