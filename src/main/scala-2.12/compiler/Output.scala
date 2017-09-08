package compiler

import compiler.errors.ErrorAccumulator
import compiler.stages.MatchType
import optic.parsers.GraphUtils.{AstPrimitiveNode, AstType, BaseNode}
import sdk.descriptions.Finders.FinderPath
import sdk.descriptions._
import sourcegear.Gear
import sourcegear.gears.parsing.ParseGear
import optic.parsers.types.GraphTypes.AstGraph

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

case class CompilerOutput(lensOutputs: Set[LensCompilerOutput]) extends Output {
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