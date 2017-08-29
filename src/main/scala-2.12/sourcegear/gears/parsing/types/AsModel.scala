package sourcegear.gears.parsing.types

import play.api.libs.json.JsObject
import sdk.descriptions.{Schema, SchemaId}
import sourcegear.gears.RuleProvider
import sourcegear.gears.helpers.ModelField
import sourcegear.gears.parsing.{MatchResults, ParseGear, ParseResult}

abstract class ParseAsModel()(implicit ruleProvider: RuleProvider) extends ParseGear {
  val schema: SchemaId


  def output(matchResults: MatchResults) : ParseResult = {

    flattenModel(matchResults.extracted)

    null
  }


  private def flattenModel(extractedOption: Option[Set[ModelField]]) : JsObject = {
    if (extractedOption.isEmpty) return JsObject.empty

    val extractedFields = extractedOption.get


    null
  }

}
