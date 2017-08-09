package compiler

import play.api.libs.json._

object JsUtils {

  def doubleQuotes(string: String) = "\""+string+"\""

  def ifStatement(predicates: Vector[ParserGeneratorNode], trueBlock: ParserGeneratorNode, falseBlock: ParserGeneratorNode) : String =
    " if ("+predicates.map(_.jsCode).filterNot(_ == null).mkString(" && ")+") { \n "+trueBlock.jsCode+" \n } else { \n "+falseBlock.jsCode+" \n } \n"

  def dot(keys: String*) = keys.mkString(".")

  def jsValueAsJsString(jsValue: JsValue) : String = {

    jsValue match {
      case s: JsString => doubleQuotes(s.value)
      case b: JsBoolean => b.value.toString
      case n: JsNumber => n.value.toString()
      //invalid
      case a: JsArray => throw new Error("AST node should not contain array as a property")
      case o: JsObject => throw new Error("AST node should not contain object as a property")
      case default => throw new Error("Unknown object type in jsValue")
    }

  }

}
