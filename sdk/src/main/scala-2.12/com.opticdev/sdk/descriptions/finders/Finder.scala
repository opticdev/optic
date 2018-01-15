package com.opticdev.sdk.descriptions.finders

import com.opticdev.parsers.graph.AstType
import com.opticdev.sdk.descriptions.Description
import com.opticdev.sdk.descriptions.enums.FinderEnums.StringEnums
import play.api.libs.json._

object Finder extends Description[Finder] {


  private implicit val stringFinderReads : Reads[StringFinder] = Json.reads[StringFinder]
  private implicit val rangeFinderReads : Reads[RangeFinder] = Json.reads[RangeFinder]


  implicit val finderReads = new Reads[Finder] {
    override def reads(json: JsValue): JsResult[Finder] = {
      try {
        JsSuccess(Finder.fromJson(json))
      } catch {
        case _: Throwable => JsError()
      }
    }
  }

  override def fromJson(jsValue: JsValue): Finder = {
    val finderType = (jsValue \ "type")

    if (finderType.isDefined && finderType.get.isInstanceOf[JsString]) {
      val result : JsResult[Finder]= finderType.get.as[JsString].value match {
        case "stringFinder"=> Json.fromJson[StringFinder](jsValue)
        case "rangeFinder"=> Json.fromJson[RangeFinder](jsValue)
//        case "nodeFinder"=> Json.fromJson[NodeFinder](jsValue)
        case _=> throw new Error("Finder Parsing Failed. Invalid Type "+finderType.get)
      }

      if (result.isSuccess) {
        result.get
      } else {
        throw new Error("Finder Parsing Failed "+result)
      }

    } else {
      throw new Error("Finder Parsing Failed. Type not provided.")
    }

  }
}

sealed trait Finder

//@todo get these into different files. Picklers need them all here for some reason even though sealed should be package, not file specific
case class StringFinder(rule: StringEnums, string: String, occurrence: Int = 0) extends Finder

case class NodeFinder(astType: AstType, range: Range) extends Finder

case class RangeFinder(start: Int, end: Int) extends Finder