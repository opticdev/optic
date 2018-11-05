package com.opticdev.core.sourcegear

import better.files.File
import com.opticdev.common.{PackageRef, SchemaRef}
import com.opticdev.common.utils.SemverHelper
import com.opticdev.core.sourcegear.annotations.AnnotationParser
import com.opticdev.core.sourcegear.context.FlatContext
import com.opticdev.core.sourcegear.graph.ProjectGraph
import com.opticdev.sdk.descriptions
import com.opticdev.core.sourcegear.project.{OpticProject, Project, ProjectBase}
import com.opticdev.core.sourcegear.transformations.TransformationCallerImpl
import com.opticdev.marvin.common.ast.NewAstNode
import com.opticdev.opm.context.{Tree, TreeContext}
import com.opticdev.parsers
import com.opticdev.parsers.SourceParserManager.parserByLanguageName
import com.opticdev.parsers.{ParserBase, ParserRef, SourceParserManager}
import com.opticdev.sdk.descriptions.transformation.generate.StagedNode
import com.opticdev.sdk.descriptions.transformation.{Transformation, TransformationRef}
import com.opticdev.sdk.skills_sdk.LensRef
import com.opticdev.sdk.skills_sdk.schema.OMSchema

import scala.util.{Failure, Success, Try}
import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

abstract class SourceGear {

  val parsers: Set[ParserBase]

  val lensSet: LensSet

  val schemas: Set[OMSchema]

  val transformations: Set[Transformation]

  val flatContext: FlatContext

  val connectedProjectGraphs: Set[ProjectGraph]

  val transformationCaller = new TransformationCallerImpl(this)

  def fileAccumulator = lensSet.fileAccumulator

  def isEmpty = parsers.isEmpty && lensSet.listLenses.isEmpty && schemas.isEmpty && schemas.isEmpty

  def findSchema(schemaRef: SchemaRef) : Option[OMSchema] = {
    val availible = schemas.filter(s=>
      s.schemaRef.packageRef.map(_.packageId) == schemaRef.packageRef.map(_.packageId)
      && s.schemaRef.id == schemaRef.id
    )
    val schemaVersion = SemverHelper.findVersion(availible, (s: OMSchema) => s.schemaRef.packageRef.get, schemaRef.packageRef.map(_.version).getOrElse("latest"))
    val result = schemaVersion.map(_._2)

    if (result.isDefined) {
      result
    } else {
      findLens(LensRef(schemaRef.packageRef, schemaRef.id)).collect{ case x: SGExportableLens if x.schema.isRight => x.schema.right.get}
    }
  }

  def findLens(lensRef: LensRef): Option[SGExportableLens] = {

    val available: Set[SGExportableLens] = lensSet.listLenses.filter(lens=>
      lensRef.packageRef.map(_.packageId).contains(lens.packageRef.packageId)
        && lens.id == lensRef.id
    )

    val lensVersion = SemverHelper.findVersion(available, (l: SGExportableLens) => l.packageRef, lensRef.packageRef.map(_.version).getOrElse("latest"))

    lensVersion.map(_._2)
  }

  def findTransformation(transformationRef: TransformationRef): Option[Transformation] = {

    val available: Set[Transformation] = transformations.filter(trans=>
      transformationRef.packageRef.map(_.packageId).contains(trans.packageId.packageId)
        && trans.id.contains(transformationRef.id)
    )

    val transformationVersion = SemverHelper.findVersion(available, (l: Transformation) => l.packageId, transformationRef.packageRef.map(_.version).getOrElse("latest"))

    transformationVersion.map(_._2)
  }

  def findParser(parserRef: ParserRef) = parsers.find(_.languageName == parserRef.languageName)

  lazy val validExtensions: Set[String] = parsers.flatMap(_.fileExtensions)
  lazy val excludedPaths: Seq[String] = parsers.flatMap(_.excludedPaths).toSeq

  def parseFile(file: File) (implicit project: ProjectBase) : Try[FileParseResults] = {
    val parserByFileName = SourceParserManager.selectParserForFileName(file.name)
    Try(file.contentAsString).flatMap(i => parseString(i, file)(project, parserByFileName.get.languageName))
  }

  def parseString(string: String, file: File = null) (implicit  project: ProjectBase, languageName: String) : Try[FileParseResults] = Try {
    val fileContents = string

    //@todo connect to parser list
    val parsedOption = SourceParserManager.parseString(fileContents, languageName)
    if (parsedOption.isSuccess) {
      val parsed = parsedOption.get
      val astGraph = parsed.graph

      val fileNameAnnotation = AnnotationParser.extractFromFileContents(fileContents, parsed.parserBase.inlineCommentPrefix).headOption
      
      implicit val sourceGearContext = SGContext(lensSet.fileAccumulator, astGraph, parserByLanguageName(languageName).get, fileContents, this, file)
      lensSet.parseFromGraph(fileContents, astGraph, sourceGearContext, project, fileNameAnnotation)
    } else {
      throw parsedOption.failed.get
    }
  }

  def isLoaded : Boolean = true

  def print = println(
    s"""
      | Parsers: ${parsers.map(_.parserRef.full).mkString(",")}
      | Schemas: ${schemas.map(_.schemaRef.full).mkString(",")}
      | Lenses: ${lensSet.listLenses.map(_.name).mkString(",")}
      | Transformations: ${transformations.map(_.yields).mkString(",")}
    """.stripMargin)

  def renderStagedNode(stagedNode: StagedNode) : Try[(NewAstNode, String, SGExportableLens)] = Render.fromStagedNode(stagedNode)(this, flatContext)

  def includedPackages = {
    lensSet.listLenses.map(_.packageRef) ++
    schemas.collect { case a if a.schemaRef.packageRef.isDefined => a.schemaRef.packageRef.get} ++
    transformations.map(_.packageId)
  }

}

case object UnloadedSourceGear extends SourceGear {
  override val parsers = Set()
  override val lensSet = new LensSet()
  override val schemas = Set()
  override val transformations = Set()
  override def isLoaded = false
  override val flatContext = FlatContext(None, Map())
  override val connectedProjectGraphs: Set[ProjectGraph] = Set()
}

object SourceGear {
  def empty: SourceGear = new SourceGear {
    override val parsers: Set[ParserBase] = Set()
    override val lensSet = new LensSet()
    override val schemas = Set()
    override val transformations = Set()
    override val flatContext = FlatContext(None, Map())
    override val connectedProjectGraphs: Set[ProjectGraph] = Set()
  }

  def unloaded = UnloadedSourceGear
}