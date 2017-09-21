package com.opticdev.core.sdk.descriptions.helpers

import com.opticdev.core.sdk.descriptions.{CodeComponent, Component, SchemaComponent}


object ComponentImplicits {
  implicit class ComponentVector(vector: Vector[Component]) {
    lazy val codeComponents: Vector[CodeComponent] = vector.filter(_.isInstanceOf[CodeComponent])
                                                           .asInstanceOf[Vector[CodeComponent]]
    lazy val schemaComponents: Vector[SchemaComponent] = vector.filter(_.isInstanceOf[SchemaComponent])
                                                               .asInstanceOf[Vector[SchemaComponent]]
  }
}
