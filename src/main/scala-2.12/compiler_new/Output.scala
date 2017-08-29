package compiler_new

import cognitro.parsers.GraphUtils.{AstPrimitiveNode, AstType, BaseNode, ChildNode}
import compiler_new.stages.MatchType
import sdk.descriptions.Finders.FinderPath
import sdk.descriptions.{Component, Rule, Snippet}
import sourcegear.gears.parsing.ParseGear

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

trait Output

case class ValidationStageOutput(isValid: Boolean,
                                 missingPaths: Set[String],
                                 extraPaths: Set[String])

case class SnippetStageOutput(astGraph: Graph[BaseNode, LkDiEdge],
                              rootNode: AstPrimitiveNode,
                              snippet: Snippet,
                              enterOn: Set[AstType],
                              entryChildren: Vector[AstPrimitiveNode],
                              matchType: MatchType.Value)


case class FinderStageOutput(snippetStageOutput: SnippetStageOutput,
                             componentFinders: Map[FinderPath, Vector[Component]],
                             ruleFinders: Map[FinderPath, Vector[Rule]])


//Source Gear factory output

case class ParserFactoryOutput(parseGear: ParseGear)