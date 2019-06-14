package com.seamless.oas.api_guru_interface.questions

import com.seamless.oas.Parser.ParseResult
import com.seamless.oas.{OASResolver, Parser}
import com.seamless.oas.api_guru_interface.{AskFilter, AskTrait, OAS2, OAS3}
import play.api.libs.json.JsArray

import scala.util.Try

object OAS3SpecsThatCantBeParsed extends AskTrait[ParseAttempt, TotalResult] {
  override def question: String = "Which OAS 3 Specs throw when we try to parse them?"

  override def filter: AskFilter = OAS3()

  override def processAPI(resolver: OASResolver, apiName: String): ParseAttempt = {
    ParseAttempt(apiName, Try(Parser.parseOAS(resolver.root.toString())))
  }

  override def report(results: ParseAttempt*): TotalResult = {
    val all = (results.size)
    val success = (results.collect {case i if i.tryResult.isSuccess => i}.size)
    val failures = (results.collect {case i if i.tryResult.isFailure => i})

    TotalResult(all, failures.size, failures.toVector)
  }
}
