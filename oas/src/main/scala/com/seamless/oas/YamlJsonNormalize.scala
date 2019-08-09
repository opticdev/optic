package com.seamless.oas

import com.seamless.serialization.TryChainUtil
import io.circe.Json
import play.api.libs.json.JsValue
import io.circe._, io.circe.parser._

import scala.util.Try

object YamlJsonNormalize {

  private def decodeJson(raw: String): Try[Json] = parse(raw).toTry
  private def decodeYaml(raw: String): Try[Json] = io.circe.yaml.parser.parse(raw).toTry

  def jsonFrom(input: String): JsValue = {
    TryChainUtil.firstSuccessIn(input,
      decodeJson,
      decodeYaml
    ).map(i => {
      play.api.libs.json.Json.parse(i.noSpaces)
    }).get
  }

}
