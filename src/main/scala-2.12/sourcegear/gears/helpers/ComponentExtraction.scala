package sourcegear.gears.helpers

import cognitro.parsers.GraphUtils.{AstPrimitiveNode, BaseNode}
import play.api.libs.json.{JsString, JsValue}
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

          component.codeType match {
            case Literal=> {
              null
            }
            case Token=> {
              ModelField(component.propertyPath, JsString(fileContents.substring(node.range._1, node.range._2)))
            }
            case _ => null
          }

        }
        case _ => null
      }
    }
  }
}