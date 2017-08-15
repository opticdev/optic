package sdk.descriptions
import play.api.libs.json._
import sdk.descriptions.helpers.{EnumReader, ParsableEnum}

object Component extends Description[Component] {

  private implicit val typesReads: Reads[Types.Value] = EnumReader.forEnum(Types)
  private implicit val codeTypesReads: Reads[CodeTypes.Value] = EnumReader.forEnum(CodeTypes)
  private implicit val finderReads = Finder.finderReads
  private implicit val optionsReads = ComponentOptions.componentOptionsReads

  private implicit val componentReads: Reads[Component] = Json.reads[Component]

  object Types extends ParsableEnum {
    val Code, Schema = Value
    override val mapping: Map[String, Value] = Map("code"-> Code, "schema"-> Schema)
  }

  object CodeTypes extends ParsableEnum {
    val Token, Literal = Value
    override val mapping: Map[String, Value] = Map("token"-> Token, "literal"-> Literal)
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
                     `type`: Component.Types.Value,
                     codeType: Component.CodeTypes.Value,
                     propertyPath: String,
                     finder: Finder,
                     options: ComponentOptions
                    )
