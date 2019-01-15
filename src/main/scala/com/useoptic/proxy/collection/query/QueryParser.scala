package com.useoptic.proxy.collection.query
import com.useoptic.common.spec_types.Parameter
import io.lemonlabs.uri.Url
import play.api.libs.json.{JsBoolean, JsNumber, JsObject}
import com.useoptic.proxy.collection.jsonschema.JsonSchemaBuilderUtil._
import com.useoptic.proxy.collection.jsonschema.JsonSchemaMerge._
import com.useoptic.utils.VectorDistinctBy._
import scala.collection.immutable
import scala.util.Try

object QueryParser {

  def parseQuery(rawUrl: String): Vector[Parameter] = {
    val params = queryParamsFromUrl(rawUrl)

    val processed: Map[String, JsObject] = params.map {
      case flatValue if flatValue._2.size == 1 => (flatValue._1, basicSchema(inferStrictType(flatValue._2.head)))
      case arrayValue if arrayValue._2.size != 1 => (arrayValue._1, {
        val distinctTypes = arrayValue._2.map(inferStrictType).distinct
        if (distinctTypes.isEmpty) {
          basicSchema("string") //should never be reached, but defaults to string
        } else if (distinctTypes.size == 1) {
          arraySchemaOneType(distinctTypes.head)
        } else {
          arraySchemaMultipleTypes(distinctTypes.map(basicSchema):_*)
        }
      })
    }

    //@assumption if only seen once, assumes required = true
    processed.map(param => Parameter("query", param._1, required = true, param._2)).toVector
  }

  def mergeQueryParameters(queryParams: Vector[Parameter]*) = {
    val flattened = queryParams.flatten.toVector
    val allParams = flattened.map(_.name).distinct
    val groupedByName = flattened.groupBy(_.name)

    val required = groupedByName.collect{ case (name, instances) if instances.size == queryParams.size =>  name}

    allParams.map(name => {
      val instances = groupedByName(name)
      val allSchemaTypes = instances.map(_.schema).distinct

      val schema = if (allSchemaTypes.size == 1) allSchemaTypes.head else mergeQuerySchemas(allSchemaTypes)

      Parameter("query", name, required.exists(i => i == name), schema)
    })
  }

  def queryParamsFromUrl(url: String) = Url.parse(url).query.paramMap

  def inferStrictType(value: String): String = {
    val tryNumber = Try(JsNumber(BigDecimal.apply(value)))
    val tryBoolean = Try(JsBoolean(value.toBoolean))

    if (tryNumber.isSuccess) "number" else if (tryBoolean.isSuccess) "boolean" else "string"
  }


}
