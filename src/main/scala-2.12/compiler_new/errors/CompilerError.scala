package compiler_new.errors

import sdk.descriptions.Finders.RangeFinder
import sdk.descriptions.Finders.StringFinder
import sdk.descriptions.Lens

trait CompilerError extends Throwable {
  implicit val lens: Lens
}


//Snippet Errors
case class ParserNotFound(lang: String, version: String)(implicit val lens: Lens) extends CompilerError {
  override def toString = "Parser Not Found for "+lens.name+". Please install "+lang+" version "+version
}

case class SyntaxError(error: Throwable)(implicit val lens: Lens) extends CompilerError {
  override def toString = "Syntax error in Snippet: "+error.toString
}

case class UnexpectedSnippetFormat(description: String)(implicit val lens: Lens) extends CompilerError {
  override def toString = "Unexpected Snippet Format: "+description
}

//Finder Errors
case class StringNotFound(stringFinder: StringFinder)(implicit val lens: Lens) extends CompilerError {
  override def toString = "String not found in snippet. "+stringFinder
}

case class StringOccurrenceOutOfBounds(stringFinder: StringFinder, matchSize: Int)(implicit val lens: Lens) extends CompilerError {
  override def toString = "String found in snippet, but invalid occurrence. Max is "+ (matchSize-1)
}
case class NodeContainingStringNotFound(stringFinder: StringFinder)(implicit val lens: Lens) extends CompilerError {
  //this one is weird, but it can happen if the value is in a comment or other ignored text.
  override def toString = "String found in snippet, but an AST Node containing it was not."
}

case class NodeStartingWithStringNotFound(stringFinder: StringFinder)(implicit val lens: Lens) extends CompilerError {
  override def toString = "String found in snippet, but an AST Node starting with it was not."
}

case class NodeWithRangeNotFound(rangeFinder: RangeFinder)(implicit val lens: Lens) extends CompilerError {
  override def toString = "A Node with range "+(rangeFinder.start, rangeFinder.end)+" not found in snippet."
}
