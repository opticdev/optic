package com.opticdev.core.sourcegear.context
import com.opticdev.common.SGExportable
import com.opticdev.core.sourcegear.{CompiledLens, SourceGear}
import com.opticdev.sdk.descriptions.transformation.Transformation
import com.opticdev.sdk.descriptions.{Lens, Schema, SchemaComponent, SchemaRef}

import scala.util.Try

object SDKObjectsResolvedImplicits {

  implicit class TransformationsResolved(transformation: Transformation) {
    def resolvedInput(implicit sourceGear: SourceGear) : SchemaRef = {

      val pId = if (transformation.input.packageRef.isDefined) {
        transformation.input.packageRef.map(_.packageId).getOrElse("")
      } else {
        transformation.packageId.packageId
      }

      Try(resolveSchema(pId, transformation.input.id).get.asInstanceOf[Schema].schemaRef)
        .getOrElse(throw new Exception(s"Schema '${transformation.input}' not found"))
    }

    def resolvedOutput(implicit sourceGear: SourceGear) : SchemaRef = {

      val pId = if (transformation.input.packageRef.isDefined) {
        transformation.output.packageRef.map(_.packageId).getOrElse("")
      } else {
        transformation.packageId.packageId
      }

      Try(resolveSchema(pId, transformation.output.id).get.asInstanceOf[Schema].schemaRef)
        .getOrElse(throw new Exception(s"Schema '${transformation.output}' not found"))
    }
  }

  implicit class LensResolved(compiledLens: CompiledLens) {
    def resolvedSchema(implicit sourceGear: SourceGear) : SchemaRef = {

      val pId = if (compiledLens.schemaRef.packageRef.isDefined) {
        compiledLens.schemaRef.packageRef.map(_.packageId).getOrElse("")
      } else {
        compiledLens.packageRef.packageId
      }

      Try(resolveSchema(pId, compiledLens.schemaRef.id).get.asInstanceOf[Schema].schemaRef)
        .getOrElse(throw new Exception(s"Schema '${compiledLens.schemaRef}' not found"))
    }
  }

  implicit class SchemaComponentResolved(schemaComponent: SchemaComponent) {
    def resolvedSchema(implicit sourceGear: SourceGear) : SchemaRef =
      Try(resolveSchema(schemaComponent.schema.packageRef.map(_.packageId).getOrElse(""), schemaComponent.schema.id).get.asInstanceOf[Schema].schemaRef)
        .getOrElse(throw new Exception(s"Schema '${schemaComponent.schema}' not found"))
  }

  private def resolveSchema(packageId: String, item: String)(implicit sourceGear: SourceGear): Option[SGExportable] =
    sourceGear.flatContext.prefix(packageId).resolve(item)

}
