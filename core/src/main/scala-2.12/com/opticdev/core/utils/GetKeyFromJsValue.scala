package com.opticdev.core.utils

import play.api.libs.json.JsValue

object GetKeyFromJsValue {
  implicit class JsValueKeyLookup(jsValue: JsValue) {
    def walk(keys: String*) = {
      keys.foldLeft(Some(jsValue): Option[JsValue]) { case (i, a) => {
        if (i.isEmpty) {
          None
        } else {
          val lookup = i.get \ a
          if (lookup.isEmpty) {
            None
          } else {
            Some(lookup.get)
          }
        }
      }}
    }
  }
}
