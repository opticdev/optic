package com.opticdev.server.http

import play.api.libs.json.{JsObject, Json}

package object routes {

  object SDKBridgeProtocol {
    case class TransformationTest(packageJson: JsObject, transformationId: String, input: JsObject, answers: JsObject)
    implicit val transformationTestFormats = Json.format[TransformationTest]
  }


}
