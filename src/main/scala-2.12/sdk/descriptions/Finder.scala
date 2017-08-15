package sdk.descriptions
import play.api.libs.json._
import sdk.descriptions.helpers.{EnumReader, ParsableEnum}

object Finder extends Description[Finder] {

  object StringRules extends ParsableEnum {
    val Entire, Containing, Starting = Value
    override val mapping: Map[String, Value] = Map("entire"-> Entire, "containing"-> Containing, "starting"-> Starting)
  }

  private implicit val stringRulesReads = EnumReader.forEnum(StringRules)

  private implicit val stringFinderReads : Reads[StringFinder] = Json.reads[StringFinder]
  private implicit val rangeFinderReads : Reads[RangeFinder] = Json.reads[RangeFinder]
  private implicit val nodeFinderReads : Reads[NodeFinder] = Json.reads[NodeFinder]


  val finderReads = new Reads[Finder] {
    override def reads(json: JsValue): JsResult[Finder] = {
      try {
        JsSuccess(Finder.fromJson(json))
      } catch {
        case _=> JsError()
      }
    }
  }

  override def fromJson(jsValue: JsValue): Finder = {
    val finderType = (jsValue \ "type")

    if (finderType.isDefined && finderType.get.isInstanceOf[JsString]) {
      val result : JsResult[Finder]= finderType.get.as[JsString].value match {
        case "string"=> Json.fromJson[StringFinder](jsValue)
        case "range"=> Json.fromJson[RangeFinder](jsValue)
        case "node"=> Json.fromJson[NodeFinder](jsValue)
        case _=> throw new Error("Finder Parsing Failed. Invalid Type "+finderType.get)
      }

      if (result.isSuccess) {
        result.get
      } else {
        throw new Error("Finder Parsing Failed "+result)
      }

    } else {
      throw new Error("Finder Parsing Failed. Invalid Type.")
    }

  }
}


trait Finder

case class StringFinder(rule: Finder.StringRules.Value, string: String, occurrence: Int) extends Finder

case class RangeFinder(start: Int, end: Int) extends Finder

case class NodeFinder(enterOn: String, block: String) extends Finder