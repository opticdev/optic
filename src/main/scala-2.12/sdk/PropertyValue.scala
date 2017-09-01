package sdk

import play.api.libs.json._

trait PropertyValue {
  def asJson : JsValue
  val value : Any
  override def equals(that: Any): Boolean =
    that match {
      case that: JsValue => this.asJson == that
      case that: PropertyValue => this.value == that.value
      case _ => super.equals(that)
    }
}

case class StringProperty(value: String) extends PropertyValue {
  override def asJson: JsString = JsString(value)
}
case class NumberProperty(value: BigDecimal) extends PropertyValue {
  override def asJson: JsNumber = JsNumber(value)
}
case class BoolProperty(value: Boolean) extends PropertyValue {
  override def asJson: JsBoolean = JsBoolean(value)
}


case class ObjectProperty(value: Map[String, PropertyValue]) extends PropertyValue {
  override def asJson: JsObject = JsObject(value.mapValues(_.asJson))
}
case class ArrayProperty(value: Vector[PropertyValue]) extends PropertyValue {
  override def asJson: JsArray = JsArray(value.map(_.asJson))
}


object PropertyValuesConversions {

  implicit class StringConvert(jsString: JsString) {
    def toScala = StringProperty(jsString.value)
  }

  implicit class NumberConvert(jsNumber: JsNumber) {
    def toScala = NumberProperty(jsNumber.value)
  }

  implicit class BoolConvert(jsBoolean: JsBoolean) {
    def toScala = BoolProperty(jsBoolean.value)
  }

  implicit class ObjectConvert(jsObject: JsObject) {
    def toScala = ObjectProperty(jsObject.value.mapValues(ValueConvert(_).toScala).toMap)
  }

  implicit class ArrayConvert(jsArray: JsArray) {
    def toScala = ArrayProperty(jsArray.value.map(ValueConvert(_).toScala).toVector)
  }

  implicit class ValueConvert(jsValue: JsValue) {
    def toScala: PropertyValue = jsValue match {
      case x: JsString => StringConvert(x).toScala
      case x: JsNumber => NumberConvert(x).toScala
      case x: JsBoolean => BoolConvert(x).toScala
      case x: JsObject => ObjectConvert(x).toScala
      case x: JsArray => ArrayConvert(x).toScala
    }
  }

}