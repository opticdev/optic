package sdk.descriptions
import play.api.libs.json._
import sdk.descriptions.Finders.{Finder, NodeFinder, RangeFinder, StringFinder}
import sdk.descriptions.enums.ComponentEnums.TypesEnum

import scala.util.Try
import enums.ComponentEnums._

object Component extends Description[Component] {


  implicit val componentReads = new Reads[Component] {
    override def reads(json: JsValue): JsResult[Component] = {
      try {
        JsSuccess(Component.fromJson(json))
      } catch {
        case _=> JsError()
      }
    }
  }


  private implicit val codeComponentReads: Reads[CodeComponent] = {
    import Finder._
    import ComponentOptions._

    Json.reads[CodeComponent]
  }

  private implicit val schemaComponentReads: Reads[SchemaComponent] = {
    import Finder._
    import ComponentOptions._
    import Schema._

    Json.reads[SchemaComponent]
  }

  override def fromJson(jsValue: JsValue): Component = {
    val componentType = (jsValue \ "type")

    if (componentType.isDefined && componentType.get.isInstanceOf[JsString]) {
      val result : JsResult[Component]= componentType.get.as[JsString].value match {
        case "code"=> Json.fromJson[CodeComponent](jsValue)
        case "schema"=> Json.fromJson[SchemaComponent](jsValue)
        case _=> throw new Error("Component Parsing Failed. Invalid Type "+componentType.get)
      }
      if (result.isSuccess) {
        result.get
      } else {
        throw new Error("Finder Parsing Failed "+result)
      }

    } else {
      throw new Error("Component Parsing Failed. Type not provided.")
    }
  }
}

sealed trait Component {
  def rules: Vector[Rule]
  val finder: Finder
  val propertyPath: String
}

case class CodeComponent(codeType: CodeEnum,
                         propertyPath: String,
                         finder: Finder,
                         options: ComponentOptions = ComponentOptions()) extends Component {
  override def rules: Vector[Rule] = codeType match {
    case Literal=> Vector(
      RawRule(finder, "ANY")
    )
    case Token=>  Vector (
      RawRule(finder, "ANY")
    )
  }
}

case class SchemaComponent(propertyPath: String,
                           schema: SchemaId,
                           finder: Finder = null) extends Component {

  override def rules: Vector[Rule] = Vector()
}
