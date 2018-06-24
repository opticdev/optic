package com.opticdev.core.trainer

import akka.actor.ActorSystem
import akka.stream.scaladsl.JavaFlowSupport.Source
import better.files.File
import com.opticdev.common.storage.DataDirectory
import com.opticdev.core.sourcegear.accumulate.FileAccumulator
import com.opticdev.core.sourcegear.{SGConstructor, SGContext, SourceGear}
import com.opticdev.core.sourcegear.actors.ActorCluster
import com.opticdev.core.sourcegear.graph.model.ModelNode
import com.opticdev.core.sourcegear.project.StaticSGProject
import com.opticdev.opm.PackageManager
import com.opticdev.opm.context.{Leaf, Tree}
import com.opticdev.opm.packages.{OpticMDPackage, OpticPackage}
import com.opticdev.opm.providers.ProjectKnowledgeSearchPaths
import com.opticdev.parsers.{AstGraph, ParserBase, SourceParserManager}
import com.opticdev.parsers.graph.CommonAstNode
import com.opticdev.sdk.markdown.MarkdownParser
import com.opticdev.sdk.markdown.MarkdownParser.MDParseOutput
import com.opticdev.sdk.opticmarkdown2.lens.OMLens
import play.api.libs.json.{JsArray, JsObject, JsString, Json}

import scala.concurrent.duration._
import scala.concurrent.Await
import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.Try

object TestLens {

  implicit lazy val actorCluster = new ActorCluster(ActorSystem("trainer"))

  def testLens(lensConfiguration: JsObject, inMarkdown: String, inputString: String) : Try[JsObject] = Try {
    val description = descriptionFromString(inMarkdown)

    val lensId = (lensConfiguration \ "id").get.as[JsString]

    val output = MDParseOutput(description)
    val lensesSeq = MDParseOutput(description).lenses.value.filterNot(i=> (i.as[JsObject] \ "id").get == lensId) :+ lensConfiguration

    val descriptionIncludingLens = description + ("lenses" -> JsArray(lensesSeq))

    val testPackage = OpticMDPackage(descriptionIncludingLens, Map())
    val testPackageRef = testPackage.packageRef

    implicit val projectKnowledgeSearchPaths = ProjectKnowledgeSearchPaths()
    val dependencyTree = PackageManager.collectPackages(testPackage.dependencies).getOrElse(Tree())

    val dependencyTreeResolved = Tree(Leaf(testPackage, dependencyTree))

    val sg = SGConstructor.fromDependencies(dependencyTreeResolved, SourceParserManager.installedParsers.map(_.parserRef)).map(_.inflate)
    val sgBuilt = Await.result(sg, 10 seconds)

    implicit val project = new StaticSGProject("trainer_project", DataDirectory.trainerScratch, sgBuilt)

    val parseResults = sgBuilt.parseString(inputString).get
    val mn = parseResults.modelNodes.minBy(_.asInstanceOf[ModelNode].resolveInGraph[CommonAstNode](parseResults.astGraph).root.graphDepth(parseResults.astGraph)).asInstanceOf[ModelNode]
    implicit val sourceGearContext = SGContext(
      sgBuilt.fileAccumulator,
      parseResults.astGraph,
      parseResults.parser,
      inputString,
      sgBuilt,
      null,
    )
    mn.expandedValue(true)
  }

  def descriptionFromString(inMarkdown: String): JsObject = {
    val desc = MarkdownParser.parseMarkdownString(inMarkdown).map(_.description).getOrElse(JsObject.empty)
    if ((desc \ "info").isEmpty) {
      desc ++ MarkdownParser.parseMarkdownString("""<!-- Package {"author": "optictest", "package": "optictest", "version": "0.0.0"} -->""").map(_.description).get
    } else {
      desc
    }
  }
}
