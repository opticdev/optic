package com.opticdev.core

import com.opticdev.common.{PackageRef, SGExportable, SchemaRef}
import com.opticdev.core.sourcegear.annotations.FileNameAnnotation
import com.opticdev.core.sourcegear.gears.rendering.Renderer
import com.opticdev.core.sourcegear.graph.model.{BaseModelNode, FlatModelNode, ModelNode}
import com.opticdev.core.sourcegear.project.ProjectBase
import com.opticdev.core.sourcegear.token_value.FileTokenRegistry
import com.opticdev.core.sourcegear.variables.VariableManager
import com.opticdev.parsers.graph.AstType
import com.opticdev.parsers.{AstGraph, ParserBase}
import com.opticdev.sdk.skills_sdk.LensRef
import com.opticdev.sdk.skills_sdk.schema.OMSchema
import play.api.libs.json.Json

package object sourcegear {

  val version = "0.1.0"

  case class FileParseResults(astGraph: AstGraph,
                              modelNodes: Vector[FlatModelNode],
                              parser: ParserBase,
                              fileContents: String,
                              fileNameAnnotationOption: Option[FileNameAnnotation],
                              fileTokenRegistry: FileTokenRegistry)

  case class AstDebugLocation(filePath: String, range: Range)(implicit project: ProjectBase) {
    override def toString: String = s"${range.start}, ${range.end} in ${project.trimAbsoluteFilePath(filePath)}"
  }

  trait SGExportableLens extends SGExportable {
    def hash: String
    def name: Option[String]
    def id: String
    def packageRef: PackageRef
    def schemaRef: SchemaRef
    def lensRef: LensRef
    def schema: Either[SchemaRef, OMSchema]
    def variableManager: VariableManager
    def enterOn: Set[AstType]
    def renderer: Renderer
    def internal: Boolean
    def priority: Int


    def usesExternalSchema = schema.isLeft
    def usesInternalSchema = schema.isRight

  }

}
