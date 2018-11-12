package com.opticdev.opm.packages

import com.opticdev.sdk.descriptions.transformation.Transformation
import com.opticdev.sdk.skills_sdk.lens.OMLens
import com.opticdev.sdk.skills_sdk.schema.OMSchema
import play.api.libs.json.JsObject

case class StagedPackage(description: JsObject) extends OpticPackage with OpticPackageFromJson {
  override val schemas: Vector[OMSchema] = Vector()
  override val lenses: Vector[OMLens] = Vector()
  override val transformations: Vector[Transformation] = Vector()
}
