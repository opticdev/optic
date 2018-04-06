package com.opticdev.core.Fixture.compilerUtils

import com.opticdev.core.compiler.Compiler.CompileWorker
import com.opticdev.core.compiler.Compiler
import com.opticdev.parsers.ParserBase
import play.api.libs.json.Json
import com.opticdev.core.sourcegear.{CompiledLens, LensSet, SourceGear}
import com.opticdev.opm.context.{Leaf, PackageContext, PackageContextFixture, Tree}
import com.opticdev.opm.packages.{OpticMDPackage, OpticPackage}
import com.opticdev.parsers.SourceParserManager

import scala.collection.mutable.ListBuffer
import scala.io.Source

trait GearUtils {

  implicit val sourceGear = new SourceGear {
    override val parsers: Set[ParserBase] = SourceParserManager.installedParsers
    override val lensSet = new LensSet()
    override val schemas = Set()
    override val transformations = Set()
  }

  def gearFromDescription(path: String): CompiledLens = {
    val jsonString = Source.fromFile(path).getLines.mkString
    val description = OpticPackage.fromJson(Json.parse(jsonString)).get.resolved()
    val dependencyTree = Tree(Leaf(description))
    val packageContext = dependencyTree.treeContext(description.packageFull).get

    val worker = new CompileWorker(description.lenses.head)
    val result = worker.compile()(packageContext, ListBuffer())

    result.get
  }

  def gearsFromDescription(path: String) : Seq[CompiledLens] = {
    val jsonString = Source.fromFile(path).getLines.mkString
    val descriptions = OpticPackage.fromJson(Json.parse(jsonString)).get.resolved()

    val dependencyTree = Tree(Leaf(descriptions))
    val packageContext = dependencyTree.treeContext(descriptions.packageFull).get


    descriptions.lenses.map(i=> {
      val worker = new CompileWorker(i)
      val compileResult = worker.compile()(packageContext, ListBuffer())
      compileResult.get
    }).toSeq
  }

  def sourceGearFromDescription(path: String) : SourceGear = {

    val outerLensSet = new LensSet()

    val jsonString = Source.fromFile(path).getLines.mkString
    val description = OpticPackage.fromJson(Json.parse(jsonString)).get.resolved()

    implicit val dependencyTree = Tree(Leaf(description))
    implicit val packageContext = PackageContextFixture.fromSchemas(description.schemas)

    val compiled = Compiler.setup(description).execute

    if (compiled.isFailure) throw new Error("Compiling description failed. Test Stopped")

    outerLensSet.addGears(compiled.gears.toSeq:_*)

    new SourceGear {
      override val parsers: Set[ParserBase] = SourceParserManager.installedParsers
      override val lensSet = outerLensSet
      override val schemas = compiled.schemas
      override val transformations = Set()
    }

  }

}
