package com.seamless.oas.api_guru_interface.questions

import com.seamless.oas.OASResolver
import com.seamless.oas.api_guru_interface.{AskFilter, AskTrait, OAS3}
import play.api.libs.json.JsArray


case class Usage(api: String, number: Int, array: JsArray)

object OA3RequestBodyComponents extends AskTrait[Option[Usage], Unit] {
  override def question: String = "How many OA3 APIs use components for request bodies?"

  override def filter: AskFilter = OAS3()

  override def processAPI(resolver: OASResolver, apiName: String): Option[Usage] = {
    val array = (resolver.root \ "components" \ "requestBodies").getOrElse(JsArray.empty).as[JsArray]

    if (array.value.nonEmpty) {
      Some(Usage(apiName, array.value.size, array))
    } else {
      None
    }

  }

  override def report(results: Option[Usage]*): Unit = {
    val positiveResults = results.collect {
      case i if i.isDefined => i.get
    }


    val average = positiveResults.map(_.number).foldLeft((0.0, 1)) ((acc, i) => ((acc._1 + (i - acc._1) / acc._2), acc._2 + 1))._1


    println(s"Total: ${positiveResults.size} / ${results.size}")
    println("Percent: " + positiveResults.size.toFloat / results.size.toFloat)
    println("Min: "+ positiveResults.map(_.number).min)
    println("Max: "+ positiveResults.map(_.number).max)
    println("Average: "+ average)
  }
}
