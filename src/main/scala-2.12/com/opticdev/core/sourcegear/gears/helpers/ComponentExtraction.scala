package com.opticdev.core.sourcegear.gears.helpers

import com.opticdev.core.sdk.descriptions.enums.ComponentEnums.{Literal, Token}
import com.opticdev.core.sdk.descriptions.{CodeComponent, Component}
import com.opticdev.core.sourcegear.SGContext
import com.opticdev.core.sourcegear.graph.enums.AstPropertyRelationship
import com.opticdev.core.sourcegear.graph.model.{AstMapping, NoMapping, NodeMapping}
import com.opticdev.parsers.AstGraph
import com.opticdev.parsers.graph.AstPrimitiveNode
import play.api.libs.json.{JsObject, JsString, JsValue}

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph


case class ModelField(propertyPath: String, value: JsValue, astMapping: AstMapping = NoMapping)

object ComponentExtraction {
  implicit class ComponentWithExtractors(component: Component) {
    def extract(node: AstPrimitiveNode)(implicit graph: AstGraph, fileContents: String, sourceGearContext: SGContext) : ModelField = {
      component match {
        case c: CodeComponent => {

          c.codeType match {
            case Literal=> {
              val result = sourceGearContext.parser.basicSourceInterface.literals.parseNode(node, node.raw)
              if (result.isFailure) throw new Error("Source code extraction error " + result.failed.get)
              ModelField(component.propertyPath, result.get, NodeMapping(node, AstPropertyRelationship.Literal))
            }
            case Token=> {
              val result = sourceGearContext.parser.basicSourceInterface.tokens.parseNode(node, node.raw)
              if (result.isFailure) throw new Error("Source code extraction error " + result.failed.get)
              ModelField(component.propertyPath, result.get, NodeMapping(node, AstPropertyRelationship.Token))
            }
          }

        }
        case _ => null
      }
    }
  }
}