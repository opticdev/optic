package com.opticdev.core.sourcegear.context
import com.opticdev.common.{PackageRef, SGExportable, SchemaRef}
import com.opticdev.core.sourcegear.{CompiledLens, CompiledMultiNodeLens, SGExportableLens, SourceGear}
import com.opticdev.opm.context.Context
import com.opticdev.sdk.descriptions.transformation.Transformation
import com.opticdev.sdk.opticmarkdown2.lens.{OMLens, OMLensSchemaComponent}
import com.opticdev.sdk.opticmarkdown2.schema.OMSchema

import scala.util.Try

object SDKObjectsResolvedImplicits {

  implicit class TransformationsResolved(transformation: Transformation) {
    def resolvedInput(implicit sourceGear: SourceGear) : SchemaRef = {

      val pId = if (transformation.input.packageRef.isDefined) {
        transformation.input.packageRef.map(_.packageId).getOrElse("")
      } else {
        transformation.packageId.packageId
      }

      val a = resolveSchema(pId, transformation.input.id)

      Try(resolveSchema(pId, transformation.input.id).get.asInstanceOf[OMSchema].schemaRef)
        .getOrElse(throw new Exception(s"Schema '${transformation.input}' not found"))
    }

    def resolvedOutput(implicit sourceGear: SourceGear) : Option[SchemaRef] = {
      transformation.output.map {
        case output =>
        val pId = if (output.packageRef.isDefined) {
          output.packageRef.map(_.packageId).getOrElse("")
        } else {
          transformation.packageId.packageId
        }

        Try(resolveSchema(pId, output.id).get.asInstanceOf[OMSchema].schemaRef)
          .getOrElse(throw new Exception(s"Schema '${transformation.output}' not found"))
      }
    }
  }

  implicit class CompiledLensResolved(compiledLens: SGExportableLens) {
    def resolvedSchema(implicit sourceGear: SourceGear) : SchemaRef = {

      val pId = if (compiledLens.schemaRef.packageRef.isDefined) {
        compiledLens.schemaRef.packageRef.map(_.packageId).getOrElse("")
      } else {
        compiledLens.packageRef.packageId
      }

      if (compiledLens.schema.isRight) {
        compiledLens.schemaRef
      } else {
        Try(resolveSchema(pId, compiledLens.schemaRef.id).get.asInstanceOf[OMSchema].schemaRef)
          .getOrElse(throw new Exception(s"Schema '${compiledLens.schemaRef}' not found"))
      }
    }
  }

  implicit class SchemaComponentResolved(schemaComponent: OMLensSchemaComponent) {
    def resolvedSchema(packageId: String)(implicit sourceGear: SourceGear) : SchemaRef = {

      val pId = if (schemaComponent.schemaRef.packageRef.isDefined) {
        schemaComponent.schemaRef.packageRef.map(_.packageId).getOrElse("")
      } else {
        packageId
      }

      Try(resolveSchema(pId, schemaComponent.schemaRef.id).get.asInstanceOf[OMSchema].schemaRef)
        .getOrElse(throw new Exception(s"Schema '${schemaComponent.schemaRef}' not found"))

    }
  }

  private def resolveSchema(packageId: String, item: String)(implicit sourceGear: SourceGear): Option[SGExportable] = {
    sourceGear.flatContext.prefix(packageId).resolve(item).collect {
      case x: OMSchema => x
      case l: CompiledLens if l.schema.isRight => l.schema.right.get
      case l: CompiledMultiNodeLens if l.schema.isRight => l.schema.right.get
    }
  }

}
