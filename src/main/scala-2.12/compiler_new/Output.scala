package compiler_new

import cognitro.parsers.GraphUtils.{AstPrimitiveNode, AstType, BaseNode, ChildNode}
import compiler_new.stages.MatchType
import sdk.descriptions.Snippet

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

trait Output

case class SnippetStageOutput(astGraph: Graph[BaseNode, LkDiEdge],
                              rootNode: AstPrimitiveNode,
                              raw: Snippet,
                              enterOn: Set[AstType],
                              entryChildren: Vector[AstPrimitiveNode],
                              matchType: MatchType.Value)
