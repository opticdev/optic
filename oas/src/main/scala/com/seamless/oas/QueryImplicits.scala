package com.seamless.oas

import com.seamless.oas.Schemas.{NamedDefinition, Operation, Path, PropertyDefinition, SharedResponse}
import play.api.libs.json.{JsObject, JsValue}

object QueryImplicits {

  implicit class PathsVector(paths: Vector[Path]) {
    def ~#(path: String) = paths.find(_.uri == path).get

    def stringify: String = {
      paths.map(_.uri).mkString("\n")
    }
  }

  implicit class OperationsVector(ops: Vector[Operation]) {
    def ~#(method: String) = ops.find(_.method == method).get
    def methodSet: Set[String] = ops.map(_.method).toSet

    def stringify: String = {
      ops.map(_.method).mkString(", ")
    }
  }

  implicit class DefinitionsVector(defs: Vector[NamedDefinition]) {
    def withRoot(rootNode: JsValue) = defs.find(_.cxt.root == rootNode)
    def ~#(name: String) = defs.find(_.name == name).get

    def stringify: String = {
      defs.map(_.name).mkString("\n")
    }
  }

  implicit class SharedResponseVector(sharedResponses: Vector[SharedResponse]) {
    def withRoot(rootNode: JsValue) = sharedResponses.find(_.cxt.root == rootNode)
  }

  implicit class PropertyDefinitionVector(props: Vector[PropertyDefinition]) {
    def ~#(key: String) = props.find(_.key == key).get
    def stringify: String = {
      props.map{ case i => s"${i.key}: ${i.definition}"}.mkString("\n")
    }
  }

}
