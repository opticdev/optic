package com.opticdev.core.trainer

import akka.actor.ActorSystem
import com.opticdev.arrow.changes.evaluation.Evaluation
import com.opticdev.common.PackageRef
import com.opticdev.common.storage.DataDirectory
import com.opticdev.core.sourcegear._
import com.opticdev.core.sourcegear.actors.ActorCluster
import com.opticdev.core.sourcegear.graph.model.{FlatModelNode, ModelNode, MultiModelNode}
import com.opticdev.core.sourcegear.project.StaticSGProject
import com.opticdev.opm.PackageManager
import com.opticdev.opm.context.{Leaf, Tree}
import com.opticdev.opm.packages.OpticMDPackage
import com.opticdev.parsers.SourceParserManager
import com.opticdev.common.graph.CommonAstNode
import com.opticdev.sdk.descriptions.transformation
import com.opticdev.sdk.descriptions.transformation.MultiTransform
import com.opticdev.sdk.descriptions.transformation.generate.GenerateResult
import com.opticdev.sdk.descriptions.transformation.mutate.MutateResult
import com.opticdev.sdk.skills_sdk.LensRef
import play.api.libs.json.{JsObject, JsValue}
import scala.concurrent.Await
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._
import scala.util.Try

object TestTransformation {

  def testTransformation(description: JsObject, transformationId: String, input: JsObject, answers: JsObject) : Try[JsValue] = Try {

    implicit val (sgBuilt, project, testPackageRef) = sgAndParser(description)

    val transformationOption = sgBuilt.transformations.find(_.id == transformationId)
    require(transformationOption.isDefined, s"Transformation with id ${transformationId} not found")

    val result: Try[transformation.TransformationResult] = transformationOption.get.transformFunction.transform(input, answers, sgBuilt.transformationCaller, None)
    require(result.isSuccess, s"Error during transformation: ${result.failed.get.getMessage}")

    result.get.jsonPreview
  }

}
