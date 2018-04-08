package com.opticdev.opm.helpers

import com.opticdev.common.PackageRef
import com.opticdev.opm.packages.DependencyMapping
import com.opticdev.sdk.descriptions._
import com.opticdev.sdk.descriptions.transformation.Transformation

import scala.util.Try

object MDPackageResolveHelper {

  def resolveSchemaToGlobalSchema(schemaRef: SchemaRef, parentPackageRef: PackageRef, mapping: DependencyMapping) = {
    if (schemaRef.packageRef.isEmpty) {
      SchemaRef(Some(parentPackageRef), schemaRef.id)
    } else {
      val resolvedPackageRefOption = mapping.find(_._1.packageId == schemaRef.packageRef.get.packageId)
      if (resolvedPackageRefOption.isEmpty) throw new Error("Schema "+ schemaRef.packageRef.get.packageId+" not imported in package "+ parentPackageRef.packageId)
      SchemaRef(Some(resolvedPackageRefOption.get._2), schemaRef.id)
    }
  }

  def resolveComponents(components: Vector[Component], parentPackageRef: PackageRef, mapping: DependencyMapping): Vector[Component] = components.map(i=> {
    if (i.isInstanceOf[SchemaComponent]) {
      val sc = i.asInstanceOf[SchemaComponent]
      SchemaComponent(
        sc.propertyPath,
        resolveSchemaToGlobalSchema(sc.schema, parentPackageRef, mapping),
        sc.mapUnique,
        sc.location
      )
    } else {
      i
    }
  })

  def resolveTransformation(transformation: Transformation, parentPackageRef: PackageRef, mapping: DependencyMapping) = {
    val newInputSchema = resolveSchemaToGlobalSchema(transformation.input, parentPackageRef, mapping)
    val newOutputSchema = resolveSchemaToGlobalSchema(transformation.output, parentPackageRef, mapping)

    Transformation(transformation.yields, transformation.packageId, newInputSchema, newOutputSchema, transformation.ask, transformation.script)
  }

  def resolveLens(lens: Lens, parentPackageRef: PackageRef, mapping: DependencyMapping) : Lens = {

    val newSchema = resolveSchemaToGlobalSchema(lens.schema, parentPackageRef, mapping)

    val newComponents = resolveComponents(lens.components, parentPackageRef, mapping)

    val newSubcontainers = lens.subcontainers.map(i=> {
      SubContainer(
        i.name,
        i.pulls,
        i.childrenRule,
        resolveComponents(i.schemaComponents, parentPackageRef, mapping)
          .asInstanceOf[Vector[SchemaComponent]]
      )
    })

    Lens(
      lens.name,
      lens.id,
      newSchema,
      lens.snippet,
      newComponents,
      lens.variables,
      newSubcontainers,
      lens.packageRef
    )
  }


}
