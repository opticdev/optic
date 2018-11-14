package com.opticdev.core.sourcegear.annotations.dsl

import com.opticdev.core.namedObjectRegex
import com.opticdev.sdk.descriptions.transformation.TransformationRef
import play.api.libs.json.{JsObject, JsValue}
import RegexHelper._

trait AnnotationsDslAstNode {val nodeType: String = this.getClass.getSimpleName}
trait OperationNode extends AnnotationsDslAstNode

case class SetOperationNode(assignments: Vector[AssignmentNode]) extends OperationNode
case class AssignmentNode(keyPath: Seq[String], value: JsValue) extends AnnotationsDslAstNode

case class NameOperationNode(name: String) extends OperationNode {
  require(namedObjectRegex.matches(name), s"'$name' is not a valid object name")
}

case class TagOperationNode(name: String) extends OperationNode {
  require(namedObjectRegex.matches(name), s"'$name' is not a valid object tag")
}

case class SourceOperationNode(project: Option[String], name: String, relationshipId: Option[TransformationRef], answers: Option[JsObject]) extends OperationNode