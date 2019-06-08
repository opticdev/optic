package com.seamless.oas

import com.seamless.oas.versions.{OAS2Resolver, OAS3Resolver}
import org.scalatest.FunSpec
import play.api.libs.json.{JsObject, Json}

class ResolverTestFixture(version: String) extends FunSpec {
  require(Set("2", "3").contains(version), "not supported")

  //oas2
  val mattermost = pathToJSON("src/test/resources/mattermost-2.json")
  val adverseSchemas = pathToJSON("src/test/resources/adverse-json-schemas-2.json")
  //oas3
  val bbc = pathToJSON("src/test/resources/bbc-3.json")
  val box = pathToJSON("src/test/resources/box-3.json")

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
      new OAS3Resolver(json)
    }
  }

}
