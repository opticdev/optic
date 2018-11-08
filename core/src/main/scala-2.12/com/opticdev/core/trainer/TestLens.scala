package com.opticdev.core.trainer

import akka.actor.ActorSystem
import akka.stream.scaladsl.JavaFlowSupport.Source
import better.files.File
import com.opticdev.common.PackageRef
import com.opticdev.common.storage.DataDirectory
import com.opticdev.core.sourcegear.accumulate.FileAccumulator
import com.opticdev.core.sourcegear._
import com.opticdev.core.sourcegear.actors.ActorCluster
import com.opticdev.core.sourcegear.graph.model.{FlatModelNode, LinkedModelNode, ModelNode, MultiModelNode}
import com.opticdev.core.sourcegear.project.StaticSGProject
import com.opticdev.core.sourcegear.project.config.ProjectFile
import com.opticdev.opm.PackageManager
import com.opticdev.opm.context.{Leaf, Tree}
import com.opticdev.opm.packages.{OpticMDPackage, OpticPackage}
import com.opticdev.parsers.{ParserBase, SourceParserManager}
import com.opticdev.common.graph.CommonAstNode
import com.opticdev.sdk.VariableMapping
import com.opticdev.sdk.descriptions.transformation.mutate.StagedMutation
import com.opticdev.sdk.skills_sdk.LensRef
import com.opticdev.sdk.skills_sdk.lens.OMLens
import play.api.libs.json.{JsArray, JsObject, JsString, Json}

import scala.concurrent.duration._
import scala.concurrent.Await
import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.Try

object TestLens {

  def testLensParse(description: JsObject, lensId: String, testInput: String, language: String) : Try[JsObject] = Try {

    implicit val (sgBuilt, project, testPackageRef) = sgAndParser(description)

    val parseResults = sgBuilt.parseString(testInput)(project, language).get

    val filteredModelNodes = parseResults.modelNodes.filter(_.lensRef == LensRef(Some(testPackageRef), lensId))
    require(filteredModelNodes.nonEmpty, s"No model nodes from lens '${lensId}' found.")

    val mn: FlatModelNode = filteredModelNodes.minBy {
      case mn: ModelNode => mn.asInstanceOf[ModelNode].resolveInGraph[CommonAstNode](parseResults.astGraph).root.graphDepth(parseResults.astGraph)
      case mmn: MultiModelNode => mmn.modelNodes.head.resolveInGraph[CommonAstNode](parseResults.astGraph).root.graphDepth(parseResults.astGraph)
    }

    implicit val sourceGearContext = SGContext(
      sgBuilt.fileAccumulator,
      parseResults.astGraph,
      parseResults.parser,
      testInput,
      sgBuilt,
      null,
      parseResults.fileTokenRegistry,
      parseResults.fileImportsRegistry
    )

    val expandedValue = mn.expandedValue(true)


    if (!mn.matchesSchema()) {
      throw new SchemaDoesNotMatchException(mn.matchesSchemaErrors().get)
    }

    expandedValue
  }

  def testLensGenerate(description: JsObject, lensId: String, input: JsObject) : Try[String] = Try {
    implicit val (sgBuilt, project, testPackageRef) = sgAndParser(description)
    val variableMapping: VariableMapping = Try(input.value.get("_variables").map(i=> {
      Json.fromJson[VariableMapping](i).get
    }).get).getOrElse(Map())

    sgBuilt.findLens(LensRef(Some(testPackageRef), lensId)).get.renderer.render(input, Map(), variableMapping)
  }

  def testLensMutate(description: JsObject, lensId: String, testInput: String, language: String, newValue: JsObject) : Try[String] = Try {
    implicit val (sgBuilt, project, testPackageRef) = sgAndParser(description)
    val parseResults = sgBuilt.parseString(testInput)(project, language).get

    val filteredModelNodes = parseResults.modelNodes.filter(_.lensRef == LensRef(Some(testPackageRef), lensId))
    require(filteredModelNodes.nonEmpty, s"No model nodes from lens '${lensId}' found.")

    val mn: FlatModelNode = filteredModelNodes.minBy {
      case mn: ModelNode => mn.asInstanceOf[ModelNode].resolveInGraph[CommonAstNode](parseResults.astGraph).root.graphDepth(parseResults.astGraph)
      case mmn: MultiModelNode => mmn.modelNodes.head.resolveInGraph[CommonAstNode](parseResults.astGraph).root.graphDepth(parseResults.astGraph)
    }

    implicit val sourceGearContext = SGContext(
      sgBuilt.fileAccumulator,
      parseResults.astGraph,
      parseResults.parser,
      testInput,
      sgBuilt,
      null,
      parseResults.fileTokenRegistry,
      parseResults.fileImportsRegistry
    )

    import com.opticdev.core.sourcegear.mutate.MutationImplicits._
    implicit val fileContents = testInput

    mn match {
      case mn: ModelNode => mn.asInstanceOf[ModelNode].resolveInGraph[CommonAstNode](parseResults.astGraph).update(newValue)
      case mmn: MultiModelNode => mmn.modelNodes.head.resolveInGraph[CommonAstNode](parseResults.astGraph).update(newValue)
    }
  }

}
