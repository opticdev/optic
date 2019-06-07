package com.seamless.oas.versions.oas2

import com.seamless.oas.versions.OAS2Resolver
import org.scalatest.FunSpec
import play.api.libs.json.{JsObject, Json}

class ResolverTestFixture(version: String) extends FunSpec {
  require(Set("2", "3").contains(version), "not supported")

  val mattermost = pathToJSON("src/main/resources/mattermost-2.json")
  val adverseSchemas = pathToJSON("src/main/resources/adverse-json-schemas-2.json")

  def pathToJSON(file: String): JsObject = {
    val loaded = scala.io.Source.fromFile(file)
    val source = loaded.getLines mkString "\n"
    loaded.close()
    Json.parse(source).as[JsObject]
  }

  def resolverFor(json: JsObject) = {
    if (version == "2") {
      new OAS2Resolver(json)
    } else {
      null
    }
  }

}
