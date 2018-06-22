package com.opticdev.opm.context

import com.opticdev.sdk.descriptions.PackageExportable
import com.opticdev.sdk.opticmarkdown2.schema.OMSchema

case class PackageContextFixture(map: Map[String, PackageExportable]) extends Context {

  def lookup(key: String) = map.get(key)

  def getPackageContext(packageId: String): Option[PackageContext] = ???
  def getDependencyProperty(fullPath: String): Option[PackageExportable] = lookup(fullPath)
  def getProperty(propertyKey: String) : Option[PackageExportable] = lookup(propertyKey)
}

object PackageContextFixture {

  def fromSchemas(schemas: Seq[OMSchema]) = {
    PackageContextFixture(schemas.map(i=> (i.schemaRef.id, i)).toMap)
  }

}
