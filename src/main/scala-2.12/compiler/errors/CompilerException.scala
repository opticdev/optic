package compiler.errors

import sdk.descriptions.Finders.{FinderPath, RangeFinder, StringFinder}
import sdk.descriptions.{CodeComponent, Component, Lens, SchemaId}

import scala.util.control.NonFatal

trait CompilerException extends Exception {
  val lens: Lens
}

//Validation Stage
case class SchemaNotFound(schemaId: SchemaId)(implicit val lens: Lens) extends CompilerException {
  override def toString = "The schema "+schemaId.id+" was not found in description"
}

//Snippet Exception
case class ParserNotFound(lang: String, version: String)(implicit val lens: Lens) extends CompilerException {
  override def toString = "Parser Not Found for "+lens.name+". Please install "+lang+" version "+version
}

case class SyntaxError(error: Throwable)(implicit val lens: Lens) extends CompilerException {
  override def toString = "Syntax error in Snippet: "+error.toString
}

case class UnexpectedSnippetFormat(description: String)(implicit val lens: Lens) extends CompilerException {
  override def toString = "Unexpected Snippet Format: "+description
}

//Finder CompilerError
case class StringNotFound(stringFinder: StringFinder)(implicit val lens: Lens) extends CompilerException {
  override def toString = "String not found in snippet. "+stringFinder
}

case class StringOccurrenceOutOfBounds(stringFinder: StringFinder, matchSize: Int)(implicit val lens: Lens) extends CompilerException {
  override def toString = "String found in snippet, but invalid occurrence. Max is "+ (matchSize-1)
}
case class NodeContainingStringNotFound(stringFinder: StringFinder)(implicit val lens: Lens) extends CompilerException {
  //this one is weird, but it can happen if the value is in a comment or other ignored text.
  override def toString = "String found in snippet, but an AST Node containing it was not."
}

case class NodeStartingWithStringNotFound(stringFinder: StringFinder)(implicit val lens: Lens) extends CompilerException {
  override def toString = "String found in snippet, but an AST Node starting with it was not."
}

case class NodeWithRangeNotFound(rangeFinder: RangeFinder)(implicit val lens: Lens) extends CompilerException {
  override def toString = "A Node with range "+(rangeFinder.start, rangeFinder.end)+" not found in snippet."
}


//Finder Stage CompilerError
case class InvalidComponents(invalidComponents: Set[CodeComponent])(implicit val lens: Lens) extends CompilerException {
  override def toString = invalidComponents.size+" code components were not found in Snippet."
}

//Walkable Paths Error
case class AstPathNotFound(finderPath: FinderPath)(implicit val lens: Lens) extends CompilerException {
  override def toString = "AstPathNotFound to target node. Internal Error. "+finderPath
}