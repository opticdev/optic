package com.seamless.oas.api_guru_interface.questions

import com.seamless.oas.OASResolver
import com.seamless.oas.api_guru_interface.{All, AskFilter, AskTrait}
import play.api.libs.json.{JsString, Json}


object LicenseField extends AskTrait[String, Unit] {

  override def question: String = "What is the distribution of licesne fields?"

  override def filter: AskFilter = All()

  override def processAPI(resolver: OASResolver, apiName: String): String = {
    resolver.license.getOrElse("NONE")
  }

  override def report(results: String*): Unit = {

    val grouped = results.groupBy(i => i).mapValues(i => i.size)
    grouped.toSeq.sortBy(_._2)
      .reverse
      .foreach(i => println(s"""${i._1} : ${i._2}"""))
  }
}
