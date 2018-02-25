package com.opticdev.opm.helpers

import com.opticdev.common.PackageRef
import com.opticdev.opm.packages.DependencyMapping
import com.opticdev.sdk.descriptions._

import scala.util.Try

object MDPackageResolveHelper {

  def resolveSchemaToGlobalSchema(schemaRef: SchemaRef, parentPackageRef: PackageRef, mapping: DependencyMapping) = {
    if (schemaRef.packageRef == null) {
      SchemaRef(parentPackageRef, schemaRef.id)
    } else {
      val resolvedPackageRefOption = mapping.find(_._1.packageId == schemaRef.packageRef.packageId)
      if (resolvedPackageRefOption.isEmpty) throw new Error("Schema "+ schemaRef.packageRef.packageId+" not imported in package "+ parentPackageRef.packageId)
      SchemaRef(resolvedPackageRefOption.get._2, schemaRef.id)
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
    val newInputSchema = resolveSchemaToGlobalSchema(transformation.inputSchema, parentPackageRef, mapping)
    val newOutputSchema = resolveSchemaToGlobalSchema(transformation.outputSchema, parentPackageRef, mapping)

    Transformation(newInputSchema, newOutputSchema, transformation.code)
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
      newSchema,
      lens.snippet,
      newComponents,
      lens.variables,
      newSubcontainers,
      lens.packageRef
    )
  }


}
