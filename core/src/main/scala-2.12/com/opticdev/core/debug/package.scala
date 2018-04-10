package com.opticdev.core

import com.opticdev.common.PackageRef
import com.opticdev.core.sourcegear.graph.model.{BaseModelNode, ModelNode}
import com.opticdev.opm.DependencyTree
import com.opticdev.opm.context.Context
import com.opticdev.parsers.graph.{AstType, WithinFile}
import com.opticdev.sdk.descriptions.transformation.Transformation
import com.opticdev.sdk.descriptions.{Lens, PackageExportable, Schema, SchemaRef}
import play.api.libs.json.{JsObject, JsValue}

package object debug {

  case class DebugAstNode[S <: PackageExportable](nodeType: AstType, range: Range, sdkObject: S)(implicit val packageContext: Context) extends WithinFile {
    def isSchema = sdkObject.isInstanceOf[Schema]
    def isLens = sdkObject.isInstanceOf[Lens]
    def isTransformation = sdkObject.isInstanceOf[Transformation]
  }

  object DebugLanguageProxy {

    private val debugLanguageProxy = "DEBUG"

    val rootMarkdownNode = AstType(debugLanguageProxy, "ROOT_MARKDOWN")

    val schemaNode = AstType(debugLanguageProxy, "SCHEMA")
    val lensNode = AstType(debugLanguageProxy, "LENS")
    val transformationNode = AstType(debugLanguageProxy, "TRANSFORMATION")
    //  val containerNode = AstType(debugLanguageProxy, "CONTAINER")
  }

  object DebugSchemaProxy {

    private val debugLanguageProxyPackage = PackageRef("optic:internal", "1.0.0")

    val schemaNode = SchemaRef(Some(debugLanguageProxyPackage), "SCHEMA")
    val lensNode = SchemaRef(Some(debugLanguageProxyPackage), "LENS")
    val transformationNode = SchemaRef(Some(debugLanguageProxyPackage), "TRANSFORMATION")
    //  val containerNode = AstType(debugLanguageProxy, "CONTAINER")
  }

  trait DebugInfo {
    def toJson : JsValue
  }

}
