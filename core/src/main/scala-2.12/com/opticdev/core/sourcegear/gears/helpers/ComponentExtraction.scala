package com.opticdev.core.sourcegear.gears.helpers

import com.opticdev.core.sourcegear.SGContext
import com.opticdev.core.sourcegear.graph.enums.AstPropertyRelationship
import com.opticdev.core.sourcegear.graph.model.{AstMapping, NoMapping, NodeMapping}
import com.opticdev.parsers.AstGraph
import com.opticdev.parsers.graph.CommonAstNode
import com.opticdev.sdk.opticmarkdown2.lens._
import play.api.libs.json.{JsObject, JsString, JsValue}
import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph


case class ModelField(propertyPath: Seq[String], value: JsValue, astMapping: AstMapping = NoMapping)

object ComponentExtraction {
  implicit class ComponentWithExtractors(component: OMComponentWithPropertyPath[OMLensCodeComponent]) {
    def extract(node: CommonAstNode)(implicit graph: AstGraph, fileContents: String, sourceGearContext: SGContext) : ModelField = {
      component match {
        case c: OMComponentWithPropertyPath[OMLensCodeComponent] => {

          c.component.`type` match {

            case Literal=> {
              val result = sourceGearContext.parser.basicSourceInterface.literals.parseNode(node, graph, node.raw)
              if (result.isFailure) throw new Error("Source code extraction error " + result.failed.get)
              ModelField(c.propertyPath, result.get, NodeMapping(node, AstPropertyRelationship.Literal))
            }
            case Token=> {
              val result = sourceGearContext.parser.basicSourceInterface.tokens.parseNode(node, graph, node.raw)
              if (result.isFailure) throw new Error("Source code extraction error " + result.failed.get)
              ModelField(c.propertyPath, result.get, NodeMapping(node, AstPropertyRelationship.Token))
            }
            case ObjectLiteral=> {
              val result = sourceGearContext.parser.basicSourceInterface.objectLiterals.parseNode(node, graph, fileContents)
              if (result.isFailure) throw new Error("Source code extraction error " + result.failed.get)
              ModelField(c.propertyPath, result.get, NodeMapping(node, AstPropertyRelationship.ObjectLiteral))
            }

          }

        }
        case _ => null
      }
    }
  }
}