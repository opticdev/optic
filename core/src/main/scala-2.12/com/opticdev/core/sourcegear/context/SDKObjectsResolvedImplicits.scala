package com.opticdev.core.sourcegear.context
import com.opticdev.common.{PackageRef, SGExportable}
import com.opticdev.core.sourcegear.{CompiledLens, SourceGear}
import com.opticdev.opm.context.Context
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

      val pId = if (transformation.output.packageRef.isDefined) {
        transformation.output.packageRef.map(_.packageId).getOrElse("")
      } else {
        transformation.packageId.packageId
      }

      Try(resolveSchema(pId, transformation.output.id).get.asInstanceOf[Schema].schemaRef)
        .getOrElse(throw new Exception(s"Schema '${transformation.output}' not found"))
    }
  }

  implicit class CompiledLensResolved(compiledLens: CompiledLens) {
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
    def resolvedSchema(packageId: String)(implicit sourceGear: SourceGear) : SchemaRef = {

      val pId = if (schemaComponent.schema.packageRef.isDefined) {
        schemaComponent.schema.packageRef.map(_.packageId).getOrElse("")
      } else {
        packageId
      }

      Try(resolveSchema(pId, schemaComponent.schema.id).get.asInstanceOf[Schema].schemaRef)
        .getOrElse(throw new Exception(s"Schema '${schemaComponent.schema}' not found"))

    }
  }

  private def resolveSchema(packageId: String, item: String)(implicit sourceGear: SourceGear): Option[SGExportable] =
    sourceGear.flatContext.prefix(packageId).resolve(item)


  def qualifySchema(packageRef: PackageRef, schemaRef: SchemaRef)(implicit packageContext: Context) : SchemaRef = {
    if (schemaRef.packageRef.isDefined) {
      packageContext.getPackageContext(schemaRef.packageRef.get.packageId).get
        .getProperty(schemaRef.id).get.asInstanceOf[Schema].schemaRef
    } else {
      SchemaRef(Some(packageRef), schemaRef.id)
    }
  }

}
