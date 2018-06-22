package com.opticdev.core

import com.opticdev.common.{PackageRef, SGExportable, SchemaRef}
import com.opticdev.core.sourcegear.annotations.FileNameAnnotation
import com.opticdev.core.sourcegear.gears.rendering.Renderer
import com.opticdev.core.sourcegear.graph.model.{BaseModelNode, FlatModelNode, ModelNode}
import com.opticdev.core.sourcegear.project.ProjectBase
import com.opticdev.core.sourcegear.variables.VariableManager
import com.opticdev.parsers.graph.AstType
import com.opticdev.parsers.{AstGraph, ParserBase}
import com.opticdev.sdk.opticmarkdown2.LensRef
import play.api.libs.json.Json

package object sourcegear {

  val version = "0.1.0"

  case class FileParseResults(astGraph: AstGraph, modelNodes: Vector[FlatModelNode], parser: ParserBase, fileContents: String, fileNameAnnotationOption: Option[FileNameAnnotation])

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
    def variableManager: VariableManager
    def enterOn: Set[AstType]
    def renderer: Renderer
  }

}
