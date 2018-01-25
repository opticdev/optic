package com.opticdev.core.compiler.errors

import com.opticdev.core.compiler.helpers.FinderPath
import com.opticdev.opm.OpticMDPackage
import com.opticdev.sdk.descriptions.finders.{NodeFinder, RangeFinder, StringFinder}
import com.opticdev.sdk.descriptions.finders.{RangeFinder, StringFinder}
import com.opticdev.sdk.descriptions.{CodeComponent, Lens, SchemaRef}

import scala.util.control.NonFatal

trait CompilerException extends Exception {
  val lens: Lens
}

//Validation Stage
case class SchemaNotFound(schemaId: SchemaRef)(implicit val lens: Lens) extends CompilerException {
  override def toString = "The schema "+schemaId.id+" was not found in description"
}

//Snippet Exception
case class ParserNotFound(lang: String, version: String)(implicit val lens: Lens) extends CompilerException {
  override def toString = "Parser Not Found for "+lens.name+". Please install "+lang+" version "+version
}

case class DuplicateContainerNamesInSnippet(duplicateNames: Vector[String])(implicit val lens: Lens) extends CompilerException {
  override def toString = s"Duplicate container names [${duplicateNames.mkString(", ")}] defined in snippet."
}

case class ContainerDefinitionConflict()(implicit val lens: Lens) extends CompilerException {
  override def toString = s"More than one container is defined for the same AST node."
}

case class ContainerHookIsNotInAValidAstNode(containerName: String, validNodes: Seq[String])(implicit val lens: Lens) extends CompilerException {
  override def toString = s"Container Hook $containerName is not in a valid node for this language: [${validNodes.mkString(", ")}]"
}


case class SyntaxError(error: Throwable)(implicit val lens: Lens) extends CompilerException {
  override def toString = "Syntax error in Snippet: "+error.toString
}

case class UnexpectedSnippetFormat(description: String)(implicit val lens: Lens) extends CompilerException {
  override def toString = "Unexpected Snippet Format: "+description
}

//Finder CompilerError

case class NodeNotFound(nodeFinder: NodeFinder)(implicit val lens: Lens) extends CompilerException {
  override def toString = "A node of type " + nodeFinder.astType +" not found at range "+ nodeFinder.range
}

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

case class SomePackagesFailedToCompile(errors: Map[OpticMDPackage, Map[Lens, ErrorAccumulator]]) extends Exception