package com.opticdev.core.compiler

import com.opticdev.core.compiler.errors.ErrorAccumulator
import com.opticdev.core.compiler.stages.MatchType
import com.opticdev.core.sdk.descriptions._
import com.opticdev.core.sdk.descriptions.finders.FinderPath
import com.opticdev.core.sourcegear.Gear
import com.opticdev.core.sourcegear.gears.generating.GenerateGear
import com.opticdev.core.sourcegear.gears.parsing.ParseGear
import com.opticdev.parsers.AstGraph
import com.opticdev.parsers.graph.{AstPrimitiveNode, AstType}

import scala.util.Try
import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

sealed trait Output

case class ValidationStageOutput(isValid: Boolean,
                                 missingPaths: Set[String],
                                 extraPaths: Set[String])

case class SnippetStageOutput(astGraph: AstGraph,
                              rootNode: AstPrimitiveNode,
                              snippet: Snippet,
                              enterOn: Set[AstType],
                              entryChildren: Vector[AstPrimitiveNode],
                              matchType: MatchType.Value)


case class FinderStageOutput(componentFinders: Map[FinderPath, Vector[Component]],
                             ruleFinders: Map[FinderPath, Vector[Rule]])


//Source Gear factory output

case class ParserFactoryOutput(parseGear: ParseGear)
case class GeneratorFactoryOutput(generateGear: GenerateGear)

sealed trait LensCompilerOutput extends Output {
  val isSuccess = false
  val isFailure = false
  val lens: Lens
  val errorAccumulator: ErrorAccumulator
  def printErrors = {}
  def get : Gear = null
}
case class Success(lens: Lens, gear: Gear) extends LensCompilerOutput {
  override val isSuccess = true
  override val errorAccumulator: ErrorAccumulator = null
  override def get = gear
}
case class Failure(lens: Lens, errorAccumulator: ErrorAccumulator) extends LensCompilerOutput {
  override val isFailure = true
  override def printErrors = errorAccumulator.printAll
}

case class CompilerOutput(lensOutputs: Set[LensCompilerOutput], schemas: Set[Schema]) extends Output {
  lazy val isSuccess = lensOutputs.forall(_.isSuccess)
  lazy val isFailure = !isSuccess

  lazy val gears: Set[Gear] = lensOutputs.filter(_.isSuccess).map(_.get)
  lazy val errors: Map[Lens, ErrorAccumulator] = lensOutputs.filter(_.isFailure).map(i=> i.lens -> i.errorAccumulator).toMap

  def printErrors = errors.foreach(i=> {
    println(i._1.name+":")
    println(i._2.printAll)
    println()
  })

}