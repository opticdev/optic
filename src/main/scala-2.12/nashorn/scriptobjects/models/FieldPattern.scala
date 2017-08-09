package nashorn.scriptobjects.models

import cognitro.parsers.GraphUtils.Path.PropertyPathWalker
import play.api.libs.json.{JsNumber, JsObject, JsString, JsValue}

case class FieldPattern(fieldPath: String, value: FieldPatternValue) {
  def evaluate(jsObject: JsObject) : Boolean = evaluate(new PropertyPathWalker(jsObject))

  def evaluate(propertyPathWalker: PropertyPathWalker) : Boolean = {
    val property = propertyPathWalker.getProperty(fieldPath)
    if (property.isDefined) {
      value.evaluate(property.get)
    } else false
  }
}


sealed trait FieldPatternValueKeys {
  val keyVector : Vector[String]
  def containsKeys(jsValue: JsValue) = {
    keyVector.foldLeft(false){
      case (b, i) => b || (jsValue \ i).toOption.isDefined
    }
  }

  def extractValues(jsValue: JsValue): Map[String, JsValue] = {
    keyVector.filter(key=> (jsValue \ key).toOption.isDefined)
      .map(key=> (key, (jsValue \ key).get))
      .toMap
  }

  def parseToInteger(jsValue: JsValue, key: String) : Integer = {
    val valueOpt = (jsValue \ key)
    if (valueOpt.toOption.isDefined) {
      val value = valueOpt.get

      if (value.isInstanceOf[JsNumber]) {
        Int.box(value.as[JsNumber].value.toInt)
      } else null

    } else null
  }


  def parseToString(jsValue: JsValue, key: String) : String = {
    val valueOpt = (jsValue \ key)
    if (valueOpt.toOption.isDefined) {
      val value = valueOpt.get

      if (value.isInstanceOf[JsString]) {
        value.as[JsString].value
      } else null

    } else null
  }


  def keysToObject(jsValue: JsValue) : FieldPatternValue

}

sealed trait FieldPatternValue {
  def evaluate(jsValue: JsValue): Boolean
}

case class AnyPattern() extends FieldPatternValue {
  override def  evaluate(jsValue: JsValue): Boolean = true
}

case class ValuePattern(value: JsValue) extends FieldPatternValue {
  override def evaluate(jsValue: JsValue): Boolean = jsValue == value
}






object StringValuePattern extends FieldPatternValueKeys {
  override val keyVector = Vector("$regex", "$minLength", "$maxLength")

  override def keysToObject(jsValue: JsValue): FieldPatternValue = {
    val values = extractValues(jsValue)

    StringPattern(
      parseToString(jsValue, "$regex"),
      parseToInteger(jsValue, "$minLength"),
      parseToInteger(jsValue, "$maxLength")
    )
  }
}

case class StringPattern(regex: String = null, minLength: Integer = null, maxLength: Integer = null) extends FieldPatternValue {
  override def evaluate(jsValue: JsValue): Boolean = {
    if (jsValue.isInstanceOf[JsString]) {
      val asString = jsValue.as[JsString].value

      var matches = true
      //after matches becomes false, all subsequent statements will evaluate false
      if (matches && regex != null) {
        matches = asString.matches(regex)
      }

      if (matches && maxLength != null) {
        matches = asString.length <= maxLength
      }

      if (matches && minLength != null) {
        matches = asString.length >= minLength
      }

      matches

    } else false
  }
}




object NumberValuePattern extends FieldPatternValueKeys {
  override val keyVector = Vector("$gt", "$lt", "$gte", "$lte", "$equalTo")

  override def keysToObject(jsValue: JsValue): FieldPatternValue = {
    val values = extractValues(jsValue)

    val results = keyVector.map(key=> parseToInteger(jsValue, key))

    NumberValuePattern(
      results(0), results(1), results(2), results(3),results(4)
    )
  }
}
case class NumberValuePattern(gt: Integer = null,
                              lt: Integer = null,
                              gte: Integer = null,
                              lte: Integer = null,
                              equalTo: Integer = null) extends FieldPatternValue {


  if (gt != null && gte != null) {
    throw new Error("Can't define $gt && $gte in same predicate")
  }

  if (lt != null && lte != null) {
    throw new Error("Can't define $lt && $lte in same predicate")
  }

  if (equalTo != null && (lt != null || lte != null || gt != null || gte != null) ) {
    throw new Error("Can't define $equalTo in combination with other numerical conditions")
  }

  override def evaluate(jsValue: JsValue): Boolean = {
    if (jsValue.isInstanceOf[JsNumber]) {
      val asNumber = jsValue.as[JsNumber].value.toInt

      var matches = true

      //after matches becomes false, all subsequent statements will evaluate false
      if (matches && equalTo != null) {
        matches = asNumber == equalTo
      }

      if (matches && lt != null) {
        matches = asNumber < lt
      }

      if (matches && gt != null) {
        matches = asNumber > gt
      }

      if (matches && lte != null) {
        matches = asNumber <= lte
      }

      if (matches && gte != null) {
        matches = asNumber >= gte
      }

      matches

    } else false
  }
}