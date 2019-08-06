package com.seamless.oas.api_guru_interface

import com.seamless.oas.{OASResolver, OASResolverHelper}
import play.api.libs.json.JsObject

import scala.util.Try


sealed trait AskFilter {
  def apply(tuple: (String, OASResolver)): Boolean
}
case class All(additionalFilter: (String, OASResolver) => Boolean = (a, b) => true) extends AskFilter {
  def apply(tuple: (String, OASResolver)): Boolean = tuple._2 != null && additionalFilter(tuple._1, tuple._2)
}
case class OAS3(additionalFilter: (String, OASResolver) => Boolean = (a, b) => true) extends AskFilter {
  def apply(tuple: (String, OASResolver)): Boolean = tuple._2 != null && tuple._2.oas_version == "3" && additionalFilter(tuple._1, tuple._2)
}
case class OAS2(additionalFilter: (String, OASResolver) => Boolean = (a, b) => true) extends AskFilter {
  def apply(tuple: (String, OASResolver)): Boolean = tuple._2 != null && tuple._2.oas_version == "2" && additionalFilter(tuple._1, tuple._2)
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

  def filter: AskFilter = All()

  def processAPI(resolver: OASResolver, apiName: String): IntermediateResult
  def report(results: IntermediateResult*): Result
}
