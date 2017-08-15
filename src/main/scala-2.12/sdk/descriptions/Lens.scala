package sdk.descriptions

import play.api.libs.json.{JsResult, JsValue, Json, Reads}


object Lens extends Description[Lens] {

  implicit val lensReads = {
    import Schema._
    import Snippet._
    import Component._

    Json.reads[Lens]
  }

  override def fromJson(jsValue: JsValue): Lens = {

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
                snippet: Snippet,
               //@todo implement rules
//                rules: Vector[String],
                components: Vector[Component]
               )
