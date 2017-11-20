package com.opticdev.sdk

import play.api.libs.json.JsValue

package object descriptions {
  trait Description[A] {
    def fromJson(jsValue: JsValue) : A
  }

  trait PackageExportable

}
