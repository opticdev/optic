package com.opticdev.core.Fixture.compilerUtils

import com.opticdev.common.{PackageRef, SchemaRef}
import com.opticdev.core.compiler.Compiler.CompileWorker
import com.opticdev.core.compiler.Compiler
import com.opticdev.core.sourcegear.context.FlatContext
import com.opticdev.parsers.ParserBase
import play.api.libs.json.Json
import com.opticdev.core.sourcegear._
import com.opticdev.core.sourcegear.graph.ProjectGraph
import com.opticdev.opm.PackageManager
import com.opticdev.opm.context.{Leaf, PackageContext, PackageContextFixture, Tree}
import com.opticdev.opm.packages.{OpticMDPackage, OpticPackage}
import com.opticdev.parsers.SourceParserManager
import com.opticdev.sdk.skills_sdk.schema.OMSchema

import scala.collection.immutable
import scala.collection.mutable.ListBuffer
import scala.concurrent.{Await, Future}
import scala.io.Source

trait GearUtils {

  implicit val sourceGear = new SourceGear {
    override val parsers: Set[ParserBase] = SourceParserManager.installedParsers
    override val lensSet = new LensSet()
    override val schemas = Set()
    override val transformations = Set()
    override val flatContext: FlatContext = FlatContext(None, Map.empty)
    override val connectedProjectGraphs: Set[ProjectGraph] = Set()
  }

  def compiledLensFromDescription(path: String): CompiledLens = {
    val jsonString = Source.fromFile(path).getLines.mkString
    val description = OpticPackage.fromJson(Json.parse(jsonString)).get.resolved()
    val dependencyTree = Tree(Leaf(description))
    val packageContext = dependencyTree.treeContext(description.packageFull).get

    val worker = new CompileWorker(description.lenses.head)
    val result = worker.compile()(packageContext, ListBuffer())

    result.get.asInstanceOf[CompiledLens]
  }

  def compiledLensesFromDescription(path: String) : Seq[CompiledLens] = {
    val jsonString = Source.fromFile(path).getLines.mkString
    val descriptions = OpticPackage.fromJson(Json.parse(jsonString)).get.resolved()

    val dependencyTree = Tree(Leaf(descriptions))
    val packageContext = dependencyTree.treeContext(descriptions.packageFull).get


    descriptions.lenses.map(i=> {
      val worker = new CompileWorker(i)
      val compileResult = worker.compile()(packageContext, ListBuffer())
      compileResult.get.asInstanceOf[CompiledLens]
    })
  }

  def sourceGearFromDescription(path: String) : SourceGear = {

    val outerLensSet = new LensSet()

    val jsonString = Source.fromFile(path).getLines.mkString
    val description = OpticPackage.fromJson(Json.parse(jsonString)).get.resolved()

    sourceGearFromPackage(description)

  }

  def sourceGearFromPackage(description: OpticPackage) : SourceGear = {

    val outerLensSet = new LensSet()

    implicit val dependencyTree = Tree(Leaf(description))
    implicit val packageContext = PackageContextFixture.fromSchemas(description.schemas)

    val compiled = Compiler.setup(description).execute
    val compiledGears = compiled.gears.map(i=> {
      i.asInstanceOf[CompiledLens].copy(schema = Left(SchemaRef(Some(description.packageRef), i.schemaRef.id)))
    })

    if (compiled.isFailure) throw new Error("Compiling description failed. Test Stopped")

    outerLensSet.addLenses(compiledGears.toSeq:_*)

    val lenses: Seq[(String, SGExportableLens)] = outerLensSet.listLenses.map(i=> (i.id, i)).toSeq

    val schemas: Seq[(String, OMSchema)] = description.schemas.map(i=> (i.schemaRef.id, i))

    val t = description.transformations

    val g = (lenses ++ schemas).toMap

    new SourceGear {
      override val parsers: Set[ParserBase] = SourceParserManager.installedParsers
      override val lensSet = outerLensSet
      override val schemas = compiled.schemas
      override val transformations = t.toSet
      override val flatContext: FlatContext = FlatContext(None, Map(
        description.packageId -> FlatContext(Some(description.packageRef), g)
      ))
      override val connectedProjectGraphs: Set[ProjectGraph] = Set()
    }

  }

  //for debug only
  def fromDependenciesList(dependencies: String*): SourceGear = {
    val packages = dependencies.map(d=> PackageRef.fromString(d).get)
    val sgFuture = SGConstructor.fromDependencies(PackageManager.collectPackages(packages).get, SourceParserManager.installedParsers.map(_.parserRef), Set(), Vector())
    import scala.concurrent.duration._
    Await.result(sgFuture, 20 seconds).inflate
  }

}

