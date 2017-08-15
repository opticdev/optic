package sdk.descriptions
import play.api.libs.json._
import sdk.descriptions.helpers.LookupTable
import play.api.libs.json.Reads._
import play.api.libs.functional.syntax._
import play.api.libs.json._
import play.api.libs.json.Reads._
import play.api.libs.functional.syntax._

object ComponentOptions extends Description[ComponentOptions] {

  implicit val componentOptionsReads: Reads[ComponentOptions] = (
      (JsPath \ "invariant").read[Boolean] and
      (JsPath \ "lookupTable").readNullable[ Map[String, Vector[String]] ] and
      (JsPath \ "parser").readNullable[String] and
      (JsPath \ "mutator").readNullable[String]
    )(ComponentOptions.apply _)

  override def fromJson(jsValue: JsValue): ComponentOptions = {

    import LookupTable._

    val options: JsResult[ComponentOptions] = Json.fromJson[ComponentOptions](jsValue)
    if (options.isSuccess) {
      options.get
    } else {
      throw new Error("Component Options Parsing Failed "+options)
    }
  }
}

case class ComponentOptions(invariant: Boolean,
                            lookupTable: Option[Map[String, Vector[String]]],
                            parser: Option[String],
                            mutator: Option[String])
