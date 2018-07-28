package com.opticdev.sdk.opticmarkdown2.lens

import com.opticdev.common.{PackageRef, SchemaRef}
import com.opticdev.parsers.rules.ChildrenRuleTypeEnum
import com.opticdev.sdk.descriptions.PackageExportable
import com.opticdev.sdk.opticmarkdown2.compilerInputs.subcontainers.OMSubContainer
import com.opticdev.sdk.opticmarkdown2.compilerInputs.variables.OMVariable
import com.opticdev.sdk.opticmarkdown2.{LensRef, OMChildrenRuleType, OMSnippet}
import com.opticdev.sdk.opticmarkdown2.schema.OMSchema
import play.api.libs.json.JsObject

case class OMLens(name: Option[String],
                  id: String,
                  snippet: OMSnippet,
                  value: Map[String, OMLensComponent],
                  variables: Map[String, OMLensVariableScopeEnum] = Map(),
                  containers: Map[String, OMChildrenRuleType] = Map(),
                  schema: Either[SchemaRef, OMSchema],
                  initialValue: JsObject = JsObject.empty,
                  language: String = "es7", //backwards compatibility
                  packageRef: PackageRef) extends PackageExportable {

  def variablesCompilerInput: Vector[OMVariable] = variables.map(i=> OMVariable(i._1, i._2)).toVector

  def subcontainerCompilerInputs: Vector[OMSubContainer] = containers.map(i=> {
    val schemaComponents = value.collect {
      case (k: String, v: OMLensSchemaComponent) => OMComponentWithPropertyPath(Seq(k), v)
    }.toVector

    OMSubContainer(i._1, i._2, schemaComponents)
  }).toVector

  def schemaRef: SchemaRef = {
    if (schema.isLeft) {
      schema.left.get
    } else {
      schema.right.get.schemaRef
    }
  }

  def lensRef: LensRef = LensRef(Some(packageRef), id)

  def valueComponentsCompilerInput: Vector[OMComponentWithPropertyPath[OMLensComponent]] =
    value.map(i=> OMComponentWithPropertyPath(Seq(i._1), i._2)).toVector

  def valueSchemaComponentsCompilerInput: Vector[OMComponentWithPropertyPath[OMLensSchemaComponent]] = {
    value.collect {
      case (k:String, v: OMLensSchemaComponent) => {
        OMComponentWithPropertyPath(Seq(k), v)
      }
    }.toVector
  }

}


