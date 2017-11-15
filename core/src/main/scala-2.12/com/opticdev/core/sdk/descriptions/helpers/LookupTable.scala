package com.opticdev.core.sdk.descriptions.helpers

import play.api.libs.json.{JsString, JsSuccess, _}

object LookupTable {
  implicit val reads = new Reads[Map[String, Vector[String]]] {
    override def reads(json: JsValue): JsResult[Map[String, Vector[String]]] = {
      if (json == JsNull) {
        JsSuccess(null)
      } else if (json.isInstanceOf[JsObject]) {
        val obj = json.as[JsObject]
        val invalidFormat = obj.value.find(!_._2.isInstanceOf[JsArray])
        if (invalidFormat.isDefined) {
          throw new Error("Invalid Lookup Table Format. Should be {key: [string, ...]")
        }

        val result = obj.value.toMap.map(i=> {
          val justStrings = i._2.as[JsArray].value
            .filter(_.isInstanceOf[JsString])
            .map(_.as[JsString].value)
            .toVector
          (i._1, justStrings)
        })
        JsSuccess(result)
      } else {
        throw new Error("Invalid Lookup Table Format")
      }
    }
  }
}
