package com.opticdev.core.debug

import com.opticdev.opm.packages.OpticMDPackage
import com.opticdev.sdk.descriptions.transformation.Transformation
import com.opticdev.sdk.descriptions.{Lens, Schema}
import play.api.libs.json.{JsArray, JsNumber, JsObject, Json}

import scala.util.Try

object OpticMDPackageRangeImplicits {

  implicit class JsObjectPackageExportable(jsObject: JsObject) {
    def rangeIfExists : Option[Range] = Try {
      val range = (jsObject \ "range").get.as[JsObject]
      val start = (range \ "start").get.as[JsNumber].value.toInt
      val end = (range \ "end").get.as[JsNumber].value.toInt

      Range(start, end)
    }.toOption
  }

  implicit class OpticMDPackageWrapper(opticMDPackage: OpticMDPackage) {
    def rangeOfSchema(schema: Schema): Option[Range] = Try {
      val index = opticMDPackage.schemas.indexOf(schema)
      val raw = (opticMDPackage.description \ "schemas").get.as[JsArray].value
      raw.lift(index).flatMap(i => i.as[JsObject].rangeIfExists)
    }.get

    def rangeOfLens(lens: Lens): Option[Range] = Try {
      val index = opticMDPackage.lenses.indexOf(lens)
      val raw = (opticMDPackage.description \ "lenses").get.as[JsArray].value
      raw.lift(index).flatMap(i => i.as[JsObject].rangeIfExists)
    }.get

    def rangeOfTransformation(transformation: Transformation): Option[Range] = Try {
      val index = opticMDPackage.transformations.indexOf(transformation)
      val raw = (opticMDPackage.description \ "transformations").get.as[JsArray].value
      raw.lift(index).flatMap(i => i.as[JsObject].rangeIfExists)
    }.get
  }

}
