package sourcegear.gears.helpers

import cognitro.parsers.GraphUtils.{AstPrimitiveNode, BaseNode}
import play.api.libs.json.{JsObject, JsString, JsValue}
import sdk.descriptions.Component
import sourcegear.gears.ParseGear

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

case class ModelField(propertyPath: String, value: JsValue)

object ComponentExtraction {
  implicit class ComponentWithExtractors(component: Component) {
    def extract(node: AstPrimitiveNode)(implicit graph: Graph[BaseNode, LkDiEdge], fileContents: String) : ModelField = {
      import Component.CodeTypes._
      import Component.Types._
      component.`type` match {
        case Code => {

          //@todo add some exceptions

          component.codeType match {
            case Literal=> {
              //@todo need to move this logic to the parser, specifically the key.
              val valueOption = node.properties.as[JsObject] \ "value"
              ModelField(component.propertyPath, valueOption.get)
            }
            case Token=> {
              ModelField(component.propertyPath, JsString(fileContents.substring(node.range._1, node.range._2)))
            }
          }

        }
        case _ => null
      }
    }
  }
}