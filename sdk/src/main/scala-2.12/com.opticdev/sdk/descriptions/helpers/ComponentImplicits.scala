package com.opticdev.sdk.descriptions.helpers

import com.opticdev.sdk.skills_sdk.lens.{OMLensCodeComponent, OMLensComponent, OMLensSchemaComponent}

object ComponentImplicits {
  implicit class ComponentVector(vector: Vector[OMLensComponent]) {
    lazy val codeComponents: Vector[OMLensCodeComponent] = vector.collect{case x: OMLensCodeComponent => x}
    lazy val schemaComponents: Vector[OMLensSchemaComponent] = vector.collect{case x: OMLensSchemaComponent => x}
  }
}
