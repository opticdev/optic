package com.opticdev.core

import akka.actor.ActorSystem
import com.opticdev.common.PackageRef
import com.opticdev.common.storage.DataDirectory
import com.opticdev.core.sourcegear.actors.ActorCluster
import com.opticdev.core.sourcegear.project.StaticSGProject
import com.opticdev.core.sourcegear.{SGConstructor, SourceGear}
import com.opticdev.opm.PackageManager
import com.opticdev.opm.context.{Leaf, Tree}
import com.opticdev.opm.packages.OpticMDPackage
import com.opticdev.parsers.SourceParserManager
import com.opticdev.parsers.graph.AstType
import com.opticdev.sdk.descriptions.enums.BasicComponentType
import com.opticdev.sdk.descriptions.enums.FinderEnums.StringEnums
import com.opticdev.sdk.skills_sdk.lens._
import play.api.libs.json._

import scala.concurrent.Await
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._
import scala.util.Try
import scala.concurrent.Await

package object trainer {

  import com.opticdev.sdk.skills_sdk.Serialization._

  case class ValueCandidate(value: JsValue, previewString: String, stagedComponent: OMComponentWithPropertyPath[OMLensCodeComponent], schemaField: JsObject) {
    def propertyPath = stagedComponent.propertyPath
  }

  case class ContainerCandidate(name: String, previewString: String, nodeFinder: OMLensNodeFinder)
  case class VariableCandidate(name: String, occurrences: Seq[Range])

  //temp until refactored sdk

  import com.opticdev.common.rangeJsonFormats

  implicit val astTypeFormat = Json.format[AstType]

  implicit val basicComponentTypeFormat = new Format[BasicComponentType] {
    override def reads(json: JsValue): JsResult[BasicComponentType] = ???

    override def writes(o: BasicComponentType): JsValue = {
      JsString(o.getClass.getName)
    }
  }

  implicit val valueCandidateFormats = Json.format[ValueCandidate]
  implicit val containerCandidateFormats = Json.format[ContainerCandidate]
  implicit val variableCandidateFormats = Json.format[VariableCandidate]
  implicit val trainingResultsFormats = Json.format[TrainingResults]

  case class TrainingResults(candidates: Seq[ValueCandidate],
                             containerCandidates: Seq[ContainerCandidate],
                             variableCandidates: Seq[VariableCandidate]
                            ) {

    def asJson: JsValue = Json.toJson[TrainingResults](this)

  }


  case class ProjectFileOptions(name: String, location: String, firstSearchPath: String, mdFiles: Map[String, String])
  implicit val projectfileoptionsFormats = Json.format[ProjectFileOptions]


  implicit lazy val actorCluster = new ActorCluster(ActorSystem("trainer"))

  def sgAndParser(description: JsObject): (SourceGear, StaticSGProject, PackageRef) = {
    val testPackage = OpticMDPackage(description, Map())
    val testPackageRef = testPackage.packageRef

    val dependencies = testPackage.dependencies
    val dependencyTree = PackageManager.collectPackages(dependencies).getOrElse(Tree())

    val dependencyTreeResolved = Tree(Leaf(testPackage, dependencyTree))

    val sg = SGConstructor.fromDependencies(dependencyTreeResolved, SourceParserManager.installedParsers.map(_.parserRef), Set()).map(_.inflate)
    sg.onComplete(i=> i.failed.foreach(_.printStackTrace()))
    val sgBuilt = Await.result(sg, 10 seconds)

    implicit val project = new StaticSGProject("trainer_project", DataDirectory.trainerScratch, sgBuilt)

    (sgBuilt, project, testPackageRef)
  }

  case class SchemaDoesNotMatchException(errors: String) extends Exception {
    override def toString: String = s"Parsed code does not conform to schema: ${errors}"
  }
}
