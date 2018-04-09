package com.opticdev.arrow

import better.files.File
import com.opticdev.arrow.index.IndexSourceGear
import com.opticdev.common.PackageRef
import com.opticdev.core.sourcegear.context.FlatContext
import com.opticdev.core.sourcegear.project.config.ProjectFile
import com.opticdev.core.sourcegear.{LensSet, SGConstructor, SourceGear}
import com.opticdev.sdk.descriptions.transformation.Transformation
import com.opticdev.sdk.descriptions.{Schema, SchemaRef}
import play.api.libs.json.JsObject

import scala.concurrent.duration._
import scala.concurrent.Await

object ExampleSourcegears {

  lazy val sgWithTransformations = new {
    val schemaModel = Schema(SchemaRef(Some(PackageRef("optic:test", "0.1.0")), "model"), JsObject.empty)
    val schemaRoute = Schema(SchemaRef(Some(PackageRef("optic:test", "0.1.0")), "route"), JsObject.empty)
    val schemaForm = Schema(SchemaRef(Some(PackageRef("optic:test", "0.1.0")), "form"), JsObject.empty)
    val schemaFetch = Schema(SchemaRef(Some(PackageRef("optic:test", "0.1.0")), "fetch"), JsObject.empty)

    val transformationPackage = PackageRef("optic:test-transform")

    val sourceGear = new SourceGear {
      override val parsers = Set()
      override val lensSet = new LensSet()
      override val schemas = Set(schemaModel, schemaRoute, schemaForm, schemaFetch)
      override val transformations = Set(
        Transformation("Model -> Route", transformationPackage,  schemaModel.schemaRef, schemaRoute.schemaRef, Transformation.emptyAskSchema, ""),
        Transformation("Route -> Form", transformationPackage, schemaRoute.schemaRef, schemaForm.schemaRef, Transformation.emptyAskSchema, ""),
        Transformation("Route -> Fetch", transformationPackage, schemaRoute.schemaRef, schemaFetch.schemaRef, Transformation.emptyAskSchema, "")
      )
      override val flatContext: FlatContext = FlatContext(None, Map.empty)
    }

    val knowledgeGraph = IndexSourceGear.runFor(sourceGear)

  }

  lazy val exampleProjectSG = new {

    val sourceGear = {
      val future = SGConstructor.fromProjectFile(new ProjectFile(File("test-examples/resources/example_packages/express/optic.yaml")))
      Await.result(future, 10 seconds).inflate
    }

    val knowledgeGraph = IndexSourceGear.runFor(sourceGear)

  }
}
