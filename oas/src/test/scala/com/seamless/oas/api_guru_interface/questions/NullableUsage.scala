package com.seamless.oas.api_guru_interface.questions

import com.seamless.oas.OASResolver
import com.seamless.oas.api_guru_interface.{All, AskFilter, AskTrait, OAS3}
import play.api.libs.json.{JsArray, Json}

case class NullableUsage(api: String, nullableCount: Int)
object NullableUsage extends AskTrait[NullableUsage, Unit] {

  override def question: String = "How many Swagger/OpenAPI use nullable?"

  override def filter: AskFilter = All

  override def processAPI(resolver: OASResolver, apiName: String): NullableUsage = {
    val nullableCount = Json.prettyPrint(resolver.root).lines.count(i => i.contains("\"nullable\""))
    NullableUsage(apiName, nullableCount)
  }

  override def report(results: NullableUsage*): Unit = {


    results.filter(_.nullableCount > 0).foreach(println)

    println(results.filter(_.nullableCount > 0).size)
    println(results.size)

  }
}
