package com.opticdev.core.compiler.helpers

import com.opticdev.common.SchemaRef
import com.opticdev.opm.DependencyTree
import com.opticdev.opm.context.{Context, PackageContext}
import com.opticdev.sdk.descriptions.Schema

object SchemaIdImplicits {
  implicit class SchemaIdResolver(schemaId: SchemaRef) {
    def resolve()(implicit packageContext: Context) : Option[Schema] = {
      val resolvedOption = packageContext(schemaId.full)
      if (resolvedOption.isDefined && resolvedOption.get.isInstanceOf[Schema]) resolvedOption.asInstanceOf[Option[Schema]]
      else None
    }
  }
}
