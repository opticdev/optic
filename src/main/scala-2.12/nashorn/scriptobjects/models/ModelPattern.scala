package nashorn.scriptobjects.models

import cognitro.parsers.GraphUtils.{BaseNode, ModelType}
import cognitro.parsers.GraphUtils.Path.PropertyPathWalker
import play.api.libs.json._

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

case class ModelPattern(fieldPatterns: FieldPattern*) extends {

  def evaluate(value: JsObject) : Boolean = {

    val propertyPathWalker = new PropertyPathWalker(value)
    //checks each field. after the first failure remaining iterations run but return 'false' immediately before expensive comparison
    fieldPatterns.foldLeft(true) {
      case (b, i) => (b && i.evaluate(propertyPathWalker))
    }
  }

}


object ModelPattern {
  def fromJs(jsValue: JsValue) : ModelPattern = {
    if (jsValue.isInstanceOf[JsObject]) {
      val asObject = jsValue.asInstanceOf[JsObject]

      val fieldPatterns = asObject.fields.map{
        case (path, value) => {
          FieldPattern(path, fieldPatternFromJs(value))
        }
      }

      ModelPattern(fieldPatterns:_*)

    } else throw new Error("Model Patterns must be expressed as JsObjects")
  }

  private val patternMatchers = Vector(NumberValuePattern, StringValuePattern)
  def fieldPatternFromJs(jsValue: JsValue) : FieldPatternValue = {
    jsValue match {
    //basic matching
    case n: JsString => ValuePattern(n)
    case n: JsNumber => ValuePattern(n)
    case n: JsBoolean => ValuePattern(n)
    case JsNull => ValuePattern(JsNull)

    //for arrays we probably want to do contains, size, etc
    case n: JsArray => ValuePattern(n)

    case obj: JsObject => {
      val matched = patternMatchers.find(_.containsKeys(jsValue))
      if (matched.isDefined) {
        matched.get.keysToObject(jsValue)
      } else ValuePattern(obj)
    }
  }

  }

}
