package com.opticdev.core.compiler.helpers

import com.opticdev.common.SchemaRef
import com.opticdev.opm.DependencyTree
import com.opticdev.opm.context.{Context, PackageContext}
import com.opticdev.sdk.opticmarkdown2.schema.OMSchema

object SchemaIdImplicits {
  implicit class SchemaIdResolver(schemaId: SchemaRef) {
    def resolve()(implicit packageContext: Context) : Option[OMSchema] = {
      val resolvedOption = packageContext(schemaId.full)
      if (resolvedOption.isDefined && resolvedOption.get.isInstanceOf[OMSchema]) resolvedOption.asInstanceOf[Option[OMSchema]]
      else None
    }
  }
}
