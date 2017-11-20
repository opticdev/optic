package com.opticdev.core.Fixture

import com.opticdev.opm.{Leaf, OpticPackage}
import com.opticdev.opm.context.PackageContext
import com.opticdev.sdk.descriptions.Schema
import play.api.libs.json.{JsObject, JsString}

trait MockPackageContext {

  def packageContext(withSchemas: Vector[Schema]): PackageContext = {
    PackageContext(Leaf(new OpticPackage("test:item", JsObject(Seq("author" -> JsString("test"), "name" -> JsString("item"), "version" -> JsString("0.1.0")))) {
      override lazy val schemas : Map[String, Schema] = withSchemas.map(i=> (i.slug, i)).toMap
    }))
  }

}
