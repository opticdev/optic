package compiler_new.errors

import sdk.descriptions.Lens

trait CompilerError extends Throwable {
  val lens: Lens
}


//Snippet Errors
case class ParserNotFound(lens: Lens, lang: String, version: String) extends CompilerError {
  override def toString = "Parser Not Found for "+lens.name+". Please install "+lang+" version "+version
}

case class SyntaxError(lens: Lens, error: Throwable) extends CompilerError {
  override def toString = "Syntax error in Snippet: "+error.toString
}

case class UnexpectedSnippetFormat(lens: Lens, description: String) extends CompilerError {
  override def toString = "Unexpected Snippet Format: "+description
}