package com.seamless.oas.api_guru_interface

import com.seamless.oas.{OASResolver, OASResolverHelper}
import play.api.libs.json.JsObject

import scala.util.Try


sealed trait AskFilter {
  def apply(tuple: (String, OASResolver)): Boolean
}
case object All extends AskFilter {
  def apply(tuple: (String, OASResolver)): Boolean = tuple._2 != null
}
case object OAS3 extends AskFilter {
  def apply(tuple: (String, OASResolver)): Boolean = tuple._2 != null && tuple._2.oas_version == "3"
}
case object OAS2 extends AskFilter {
  def apply(tuple: (String, OASResolver)): Boolean = tuple._2 != null && tuple._2.oas_version == "2"
}


abstract class AskTrait[IntermediateResult, Result] {

  def main(args: Array[String]): Unit = run

  def run: Result = {
    AskAPIGuruAnything.prepareSpecs

    println(question+"\n\n")

    val specs = AskAPIGuruAnything.allSpecs
      .map(i => (i._1, OASResolverHelper.fromJSON(i._2)))
      .filter(filter.apply)

    println(s"Sampling ${specs.length} APIs")

    val results = specs.par.map { case (name, api) => Try {
      processAPI(api, name)
    }}.toVector

    results.foreach {
      case i if i.isFailure => println(i.failed.get.getMessage)
      case _ =>
    }

    report(results.collect { case i if i.isSuccess => i.get }:_*)
  }

  def question: String

  def filter: AskFilter = All

  def processAPI(resolver: OASResolver, apiName: String): IntermediateResult
  def report(results: IntermediateResult*): Result
}
