package sdk.descriptions

import play.api.libs.json.{JsResult, JsValue, Json, Reads}
import Schema.schemaIdReads
import Snippet.snippetReads

object Lens extends Description[Lens] {

  private implicit val lensReads = Json.reads[Lens]

  override def fromJson(jsValue: JsValue): Lens = {

    implicit val schemaReads: Reads[SchemaId] = schemaIdReads
    implicit val snippetReds: Reads[Snippet] = snippetReads

    val lens: JsResult[Lens] = Json.fromJson[Lens](jsValue)

    if (lens.isSuccess) {
      lens.get
    } else {
      throw new Error("Lens Parsing Failed "+lens)
    }
  }
}

case class Lens(name: String,
                schema: SchemaId,
                snippet: Snippet
//                rules: Vector[String],
//                components: Vector[String]
               )
