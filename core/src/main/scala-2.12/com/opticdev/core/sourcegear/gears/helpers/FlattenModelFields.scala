package com.opticdev.core.sourcegear.gears.helpers

import play.api.libs.json.{JsObject, JsString, JsValue}

object FlattenModelFields {
  def flattenFields(fieldSet: Set[ModelField], onto: JsObject = JsObject.empty) : JsObject = {
    if (fieldSet.isEmpty) return JsObject.empty

    val withPathVectors = fieldSet.map(i=> (i.propertyPath, i.value))

    val individualObjects = withPathVectors.map(field=> {
      val path = field._1
      path.foldRight[JsObject](null) { (key, obj) =>
        if (obj == null) {
          JsObject(Seq(key -> field._2))
        } else {
          JsObject(Seq(key -> obj))
        }
      }
    })

    val merged = individualObjects.foldLeft(onto) { (obj, finalObj) =>
      finalObj.deepMerge(obj)
    }

    merged

  }
}
