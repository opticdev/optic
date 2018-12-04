package com.opticdev.core.sourcegear.gears.helpers

import com.opticdev.core.sourcegear.SGContext
import com.opticdev.core.sourcegear.graph.enums.AstPropertyRelationship
import com.opticdev.core.sourcegear.graph.model.{AstMapping, NoMapping, NodeMapping}
import com.opticdev.common.graph.{AstGraph, CommonAstNode}
import com.opticdev.sdk.skills_sdk.{AssignmentOperations, SetValue}
import com.opticdev.sdk.skills_sdk.lens._
import play.api.libs.json.{JsObject, JsString, JsValue}
import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph


case class ModelField(propertyPath: Seq[String],
                      value: JsValue,
                      astMapping: AstMapping = NoMapping,
                      operation: AssignmentOperations = SetValue,
                      isHidden: Boolean = false)

object ComponentExtraction {
  implicit class ComponentWithExtractors(component: OMComponentWithPropertyPath[OMLensCodeComponent]) {
    def extract(node: CommonAstNode)(implicit graph: AstGraph, fileContents: String, sourceGearContext: SGContext) : ModelField = {
      val isHidden = component.isHidden
      component match {
        case c: OMComponentWithPropertyPath[OMLensCodeComponent] => {

          c.component.`type` match {

            case Literal=> {
              val result = sourceGearContext.parser.basicSourceInterface.literals.parseNode(node, graph, node.raw)
              if (result.isFailure) throw new Error("Source code extraction error " + result.failed.get)
              ModelField(c.propertyPath, result.get, NodeMapping(node, AstPropertyRelationship.Literal), isHidden = isHidden)
            }
            case Token=> {
              val result = sourceGearContext.parser.basicSourceInterface.tokens.parseNode(node, graph, node.raw)
              if (result.isFailure) throw new Error("Source code extraction error " + result.failed.get)
              ModelField(c.propertyPath, result.get, NodeMapping(node, AstPropertyRelationship.Token), isHidden = isHidden)
            }
            case ObjectLiteral=> {
              val result = sourceGearContext.parser.basicSourceInterface.objectLiterals.parseNode(node, graph, fileContents)
              if (result.isFailure) throw new Error("Source code extraction error " + result.failed.get)
              ModelField(c.propertyPath, result.get, NodeMapping(node, AstPropertyRelationship.ObjectLiteral), isHidden = isHidden)
            }
            case ArrayLiteral=> {
              val result = sourceGearContext.parser.basicSourceInterface.arrayLiterals.parseNode(node, graph, fileContents)
              if (result.isFailure) throw new Error("Source code extraction error " + result.failed.get)
              ModelField(c.propertyPath, result.get, NodeMapping(node, AstPropertyRelationship.ArrayLiteral), isHidden = isHidden)
            }
          }

        }
        case _ => null
      }
    }
  }
}