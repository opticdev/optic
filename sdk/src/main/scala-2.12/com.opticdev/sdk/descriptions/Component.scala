package com.opticdev.sdk.descriptions

import com.opticdev.sdk.descriptions.enums.LocationEnums.LocationTypeEnums
import com.opticdev.sdk.descriptions.enums.{BasicComponentType, NotSupported}
import com.opticdev.sdk.descriptions.finders.Finder
import play.api.libs.json._
import play.api.libs.functional.syntax._

import scala.util.Try
import enums.ComponentEnums._

object Component extends Description[Component] {


  implicit val componentReads = new Reads[Component] {
    override def reads(json: JsValue): JsResult[Component] = {
      try {
        JsSuccess(Component.fromJson(json))
      } catch {
        case _: Throwable => JsError()
      }
    }
  }


  implicit val codeComponentReads: Reads[CodeComponent] = {
    import com.opticdev.sdk.descriptions.finders.Finder._
    import ComponentOptions._

    val codeComponentReads: Reads[(Seq[String], Finder)] =
      (JsPath \ "propertyPath").read[Seq[String]] and
      (JsPath \ "finder").read[Finder] tupled

    codeComponentReads.map(i=> {
      CodeComponent(i._1, i._2, NotSupported)
    })
  }

  implicit val schemaComponentReads: Reads[SchemaComponent] = {
    import Finder._
    import ComponentOptions._
    import Schema._
    import Location._

    Json.reads[SchemaComponent]
  }

  override def fromJson(jsValue: JsValue): Component = {

    val componentType = jsValue \ "type"

    if (componentType.isDefined && componentType.get.isInstanceOf[JsString]) {
      val result : JsResult[Component]= componentType.get.as[JsString].value match {
        case "code"=> Json.fromJson[CodeComponent](jsValue)
        case "schema"=> Json.fromJson[SchemaComponent](jsValue)
        case _=> throw new Error("Component Parsing Failed. Invalid Type "+componentType.get)
      }
      if (result.isSuccess) {
        result.get
      } else {
        throw new Error("Component Parsing Failed "+result)
      }

    } else {
      throw new Error("Component Parsing Failed. Type not provided.")
    }
  }
}

sealed trait Component {
  def rules: Vector[Rule]
  val propertyPath: Seq[String]
  val componentType : BasicComponentType = NotSupported
}

case class CodeComponent(propertyPath: Seq[String],
                         finder: Finder,
                         override val componentType: BasicComponentType = NotSupported) extends Component {

  override def rules: Vector[Rule] = Vector(RawRule(finder, "ANY"))

  def withComponentType(basicComponentType: BasicComponentType) =
    new CodeComponent(propertyPath, finder, basicComponentType)

  override def equals(obj: Any): Boolean = obj match {
    case other:CodeComponent =>
      other.propertyPath == this.propertyPath &&
      other.rules == this.rules &&
      other.finder == this.finder
    case _ => false
  }

}

case class SchemaComponent(propertyPath: Seq[String],
                           schema: SchemaRef,
                           mapUnique: Boolean,
                           location: Option[Location]) extends Component {

  override def rules: Vector[Rule] = Vector()

  def fullyQualified(lens: Lens) = SchemaComponent(propertyPath, schema.fullyQualified(lens), mapUnique, location)

  def withLocation(setLocation: Location) = SchemaComponent(propertyPath, schema, mapUnique, Some(setLocation))

}
