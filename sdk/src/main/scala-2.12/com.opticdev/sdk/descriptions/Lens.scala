package com.opticdev.sdk.descriptions

import com.opticdev.common.{PackageRef}
import play.api.libs.json._


object Lens extends Description[Lens] {

  implicit val packageRefReads: Reads[PackageRef] = (json: JsValue) => {
    if (json.isInstanceOf[JsString]) {
      JsSuccess(PackageRef.fromString(json.as[JsString].value).get)
    } else {
      JsError(error = "PackageRef must be a string")
    }
  }

  implicit val lensReads = {
    import Schema._
    import Snippet._
    import Component._
    import Rule._

    Json.reads[Lens]
  }

  override def fromJson(jsValue: JsValue): Lens = {

    val lens: JsResult[Lens] = Json.fromJson[Lens](jsValue)

    if (lens.isSuccess) {
      lens.get
    } else {
      throw new Error("Lens Parsing Failed "+lens)
    }
  }
}


case class Lens(name: String,
                schema: SchemaRef,
                snippet: Snippet,
                rules: Vector[Rule],
                components: Vector[Component],
                packageRef: PackageRef = PackageRef(null, null)
               ) extends PackageExportable