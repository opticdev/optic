package com.seamless.oas.api_guru_interface.questions

import com.seamless.oas.Parser.ParseResult
import com.seamless.oas.{OASResolver, Parser}
import com.seamless.oas.api_guru_interface.{AskFilter, AskTrait, OAS2, OAS3}
import play.api.libs.json.JsArray

import scala.util.Try


case class ParseAttempt(apiName: String, tryResult: Try[ParseResult])
case class TotalResult(all: Int, failures: Int)


object OAS2SpecsThatCantBeParsed extends AskTrait[ParseAttempt, TotalResult] {
  override def question: String = "Which OAS 2 Specs throw when we try to parse them?"

  override def filter: AskFilter = OAS2

  override def processAPI(resolver: OASResolver, apiName: String): ParseAttempt = {
    ParseAttempt(apiName, Try(Parser.parseOAS(resolver.root.toString())))
  }

  override def report(results: ParseAttempt*): TotalResult = {
    val all = (results.size)
    val success = (results.collect {case i if i.tryResult.isSuccess => i}.size)
    val failures = (results.collect {case i if i.tryResult.isFailure => i}.size)
//
//    results.collect {case i if i.tryResult.isFailure => i}.foreach(i => {
//      println(i.apiName)
//      i.tryResult.failed.get.printStackTrace()
//    })

    TotalResult(all, failures)
  }
}
