package sdk.descriptions
import play.api.libs.json._
import sdk.descriptions.Finders.Finder
import sdk.descriptions.enums.ComponentEnums.TypesEnum
import sdk.descriptions.helpers.{EnumReader, ParsableEnum}

import scala.util.Try
import enums.ComponentEnums._

object Component extends Description[Component] {


  implicit val componentReads: Reads[Component] = {
    import Finder._
    import ComponentOptions._

    Json.reads[Component]
  }

  override def fromJson(jsValue: JsValue): Component = {

    val component: JsResult[Component] = Json.fromJson[Component](jsValue)
    if (component.isSuccess) {
      component.get
    } else {
      throw new Error("Component Parsing Failed "+component)
    }
  }
}

case class Component(
                      `type`: TypesEnum,
                      codeType: CodeEnum,
                      propertyPath: String,
                      finder: Finder,
                      options: ComponentOptions = ComponentOptions()) {

  def rules : Vector[Rule] = `type` match {
    case Code=> {
      codeType match {
        case Literal=> Vector(
          RawRule(finder, "ANY")
        )
        case Token=>  Vector (
          RawRule(finder, "ANY")
        )
      }
    }
    case _ => Vector()
  }

}
