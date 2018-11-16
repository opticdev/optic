package com.opticdev.core.sourcegear.project.config.options

import com.opticdev.common.SchemaRef
import play.api.libs.json._

sealed trait OpticConfigValue {
  def toJson: JsValue
}

//Primitives
case class OCString(value: String) extends OpticConfigValue { def toJson: JsValue = JsString(value) }
case class OCNumber(value: BigDecimal) extends OpticConfigValue { def toJson: JsValue = JsNumber(value) }
case class OCBoolean(value: Boolean) extends OpticConfigValue { def toJson: JsValue = JsBoolean(value) }
case class OCArray(items: OpticConfigValue*) extends OpticConfigValue { def toJson: JsValue = JsArray(items.map(_.toJson)) }
case class OCObject(fields: Map[String, OpticConfigValue]) extends OpticConfigValue { def toJson: JsValue = JsObject(fields.map(p => (p._1, p._2.toJson))) }

//Refs
case class OCObjectRef(`$objectRef`: String, typeConstraint: Option[SchemaRef]) extends OpticConfigValue {
  override def toJson: JsValue = JsObject(Seq("$objectRef" -> JsString(`$objectRef`), "typeConstraint" -> typeConstraint.map(i=> JsString(i.full)).getOrElse(JsNull)))
}

