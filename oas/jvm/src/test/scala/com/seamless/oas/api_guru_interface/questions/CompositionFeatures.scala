package com.seamless.oas.api_guru_interface.questions

import com.seamless.oas.OASResolver
import com.seamless.oas.api_guru_interface.{All, AskFilter, AskTrait, OAS3}
import play.api.libs.json.{JsArray, Json}

case class CompositionUsage(api: String, allOfCount: Int, anyOfCount: Int, oneOfCount: Int)
object CompositionFeatures extends AskTrait[CompositionUsage, Unit] {

  override def question: String = "How many Swagger/OpenAPI use allOf?"

  override def filter: AskFilter = All()

  override def processAPI(resolver: OASResolver, apiName: String): CompositionUsage = {


    val allOfCount = Json.prettyPrint(resolver.root).linesIterator.count(i => i.contains("\"allOf\""))
    val anyOfCount = Json.prettyPrint(resolver.root).linesIterator.count(i => i.contains("\"anyOf\""))
    val oneOfCount = Json.prettyPrint(resolver.root).linesIterator.count(i => i.contains("\"oneOf\""))


    CompositionUsage(apiName, allOfCount, anyOfCount, oneOfCount)
  }

  override def report(results: CompositionUsage*): Unit = {
    println(s"allOf used ${results.map(_.allOfCount).sum} times")
    println(s"anyOf used ${results.map(_.anyOfCount).sum} times")
    println(s"oneOf used ${results.map(_.oneOfCount).sum} times")


    println("\n\nallOf distribution")
    results.sortBy(_.allOfCount).reverse.filter(_.allOfCount > 5).foreach(i => println(i.allOfCount+"          "+i.api))

    println(s"\n\n used by ${results.map(_.allOfCount).count(i => i > 0).toFloat / results.length.toFloat * 100}% of APIs")

  }
}
