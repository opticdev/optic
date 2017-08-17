package sdk.descriptions.Finders
import cognitro.parsers.GraphUtils.AstPrimitiveNode
import compiler_new.SnippetStageOutput
import sdk.descriptions.Lens

case class NodeFinder(enterOn: String, block: String) extends Finder {
  override def evaluateFinder(snippetStageOutput: SnippetStageOutput)(implicit lens: Lens): AstPrimitiveNode = ???
}