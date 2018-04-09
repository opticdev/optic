package com.opticdev.core.sourcegear

import better.files.File
import com.opticdev.common.PackageRef
import com.opticdev.sdk.descriptions.{LensRef, Schema, SchemaRef}
import com.opticdev.core.sourcegear.project.{OpticProject, Project, ProjectBase}
import com.opticdev.marvin.common.ast.NewAstNode
import com.opticdev.opm.context.{Tree, TreeContext}
import com.opticdev.opm.utils.SemverHelper
import com.opticdev.parsers
import com.opticdev.parsers.{ParserBase, ParserRef, SourceParserManager}
import com.opticdev.sdk.descriptions.transformation.{StagedNode, Transformation}

import scala.util.{Failure, Success, Try}
import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

abstract class SourceGear {

  val parsers: Set[ParserBase]

  val lensSet: LensSet

  val schemas: Set[Schema]

  val transformations: Set[Transformation]

  def fileAccumulator = lensSet.fileAccumulator

  def findSchema(schemaRef: SchemaRef) : Option[Schema] = {
    val availible = schemas.filter(s=>
      s.schemaRef.packageRef.get.packageId == schemaRef.packageRef.get.packageId
      && s.schemaRef.id == schemaRef.id
    )
    val schemaVersion = SemverHelper.findVersion(availible, (s: Schema) => s.schemaRef.packageRef.get, schemaRef.packageRef.map(_.version).getOrElse("latest"))
    schemaVersion.map(_._2)
  }

  def findLens(lensRef: LensRef): Option[CompiledLens] = {

    val available: Set[CompiledLens] = lensSet.listLenses.filter(lens=>
      lensRef.packageRef.map(_.packageId).contains(lens.packageRef.packageId)
        && lens.id.contains(lensRef.id)
    )

    val lensVersion = SemverHelper.findVersion(available, (l: CompiledLens) => l.packageRef, lensRef.packageRef.map(_.version).getOrElse("latest"))

    lensVersion.map(_._2)
  }

  def findParser(parserRef: ParserRef) = parsers.find(_.languageName == parserRef.languageName)

  lazy val validExtensions: Set[String] = parsers.flatMap(_.fileExtensions)
  lazy val excludedPaths: Seq[String] = parsers.flatMap(_.excludedPaths).toSeq

  def parseFile(file: File) (implicit project: ProjectBase) : Try[FileParseResults] =
    Try(file.contentAsString).flatMap(i=> parseString(i))

  def parseString(string: String) (implicit  project: ProjectBase) : Try[FileParseResults] = Try {
    val fileContents = string
    //@todo connect to parser list
    val parsedOption = SourceParserManager.parseString(fileContents, "es7")
    if (parsedOption.isSuccess) {
      val parsed = parsedOption.get
      val astGraph = parsed.graph

      //@todo clean this up and have the parser return in the parse result. right now it only supports the test one
//      val parser = parsers.find(_.languageName == parsed.language).get
      implicit val sourceGearContext = SGContext(lensSet.fileAccumulator, astGraph, SourceParserManager.installedParsers.head, fileContents)
      lensSet.parseFromGraph(fileContents, astGraph, sourceGearContext, project)
    } else {
      throw parsedOption.failed.get
    }
  }

  def isLoaded : Boolean = true

  def print = println(
    s"""
      | Parsers: ${parsers.map(_.parserRef.full).mkString(",")}
      | Schemas: ${schemas.map(_.schemaRef.full).mkString(",")}
      | Gears: ${lensSet.listLenses.map(_.name).mkString(",")}
      | Transformations: ${transformations.map(_.yields).mkString(",")}
    """.stripMargin)

  def renderStagedNode(stagedNode: StagedNode) : Try[(NewAstNode, String, CompiledLens)] = Render.fromStagedNode(stagedNode)(this)

}

case object UnloadedSourceGear extends SourceGear {
  override val parsers = Set()
  override val lensSet = new LensSet()
  override val schemas = Set()
  override val transformations = Set()
  override def isLoaded = false
}

object SourceGear {
  def default: SourceGear = new SourceGear {
    override val parsers: Set[ParserBase] = Set()
    override val lensSet = new LensSet()
    override val schemas = Set()
    override val transformations = Set()
  }

  def unloaded = UnloadedSourceGear
}