package sourcegear.gears.parsing.types

import play.api.libs.json.JsObject
import sdk.descriptions.{Schema, SchemaId}
import sourcegear.gears.RuleProvider
import sourcegear.gears.helpers.{FlattenModelFields, ModelField}
import sourcegear.gears.parsing.{MatchResults, ParseGear, ParseResult}

abstract class ParseAsModel()(implicit ruleProvider: RuleProvider) extends ParseGear {
  val schema: SchemaId


  override def output(matchResults: MatchResults) : Option[ParseResult] = {
    if (!matchResults.isMatch) return None

    Option(ParseResult(this,
      FlattenModelFields.flattenFields(matchResults.extracted.getOrElse(Set())),
      null,
      null))

  }



}
