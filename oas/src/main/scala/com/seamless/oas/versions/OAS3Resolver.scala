package com.seamless.oas.versions

import com.seamless.oas
import com.seamless.oas.Schemas.{Definition, HeaderParameter, NamedDefinition, Operation, PathParameter, QueryParameter, RequestBody, Response, SharedResponse}
import com.seamless.oas.{Context, JSONReference, OASResolver, Schemas}
import play.api.libs.json.{JsArray, JsBoolean, JsObject, JsString}

import scala.util.Try

class OAS3Resolver(root: JsObject) extends OASResolver(root, "3") {

  override def parametersForPath(path: Schemas.Path)(implicit ctx: oas.Context): Vector[Schemas.PathParameter] = {
    import Helpers.distinctBy

    val sharedParameters = (path.cxt.root.as[JsObject] \ "parameters").getOrElse(JsArray.empty).as[JsArray].value
      .map(i => Helpers.OAS3Param(i.as[JsObject]))
      .toList


    val operationLevelParams = path.operations.flatMap {
      case op => {
        (op.cxt.root.as[JsObject] \ "parameters")
          .getOrElse(JsArray.empty).as[JsArray]
          .value
          .map(i => Helpers.OAS3Param(i.as[JsObject]))
      }
    }.toList

    val uniqueParams = distinctBy(operationLevelParams ++ sharedParameters)(i => i.name)

    val sorted = uniqueParams
      .toVector
      .filter(_.isPathParameter)
      .sortBy(param => path.uri.indexOf(s"{${param.name}"))

    sorted.zipWithIndex.map { case (param, index) => PathParameter(param.name, index)}
  }

  private def parametersForOperation(operation: Operation)(implicit ctx: Context): Vector[Helpers.OAS3Param] = {
    (operation.cxt.root.as[JsObject] \ "parameters")
      .getOrElse(JsArray.empty).as[JsArray]
      .value
      .map(i => Helpers.OAS3Param(i.as[JsObject]))
      .toVector
  }

  def queryParametersForOperation(operation: Operation)(implicit ctx: Context): Vector[QueryParameter] = {
    parametersForOperation(operation)
      .collect{ case param if param.isQueryParameter => {
        QueryParameter(param.name, param.required)
      }}
  }

  def headerParametersForOperation(operation: Operation)(implicit ctx: Context): Vector[HeaderParameter] = {
    parametersForOperation(operation)
      .collect{ case param if param.isHeaderParameter => {
        HeaderParameter(param.name, param.required)
      }}
  }

  override def requestBodyForOperation(operation: Schemas.Operation)(implicit ctx: oas.Context): Option[Schemas.RequestBody] = {
    val requestBodyOptions = (operation.cxt.root \ "requestBody").toOption.map(_.as[JsObject])

    if (operation.supportsBody && requestBodyOptions.isDefined) {
      val content = (requestBodyOptions.get \ "content").getOrElse(JsObject.empty).as[JsObject]
      val firstBody = new Helpers.OAS3Content(content).reduceToFirstBody

      if (firstBody.isDefined) {
        val schema = firstBody.get.schema
        val inlineSchema = Definition(schema, IdGenerator.inlineDefinition)(buildContext(schema))
        Some(RequestBody(Some(firstBody.get.contentType),Some(inlineSchema)))
      } else None
    } else None
  }

  override def responsesForOperation(operation: Schemas.Operation)(implicit ctx: oas.Context): Vector[Schemas.Response] = {
    val responses = (operation.cxt.root.as[JsObject] \ "responses")
      .getOrElse(JsObject.empty).as[JsObject].value.toVector
      .filter(i => Try(i._1.toInt).isSuccess)


    responses.map { case (status, description) => {
        val statusAsInt = status.toInt
        val content = (description.as[JsObject] \ "content").getOrElse(JsObject.empty).as[JsObject]

        val isRef = description.isInstanceOf[JsObject] && description.as[JsObject].value.contains("$ref")

        if (isRef) {
          val ref = description.as[JsObject].value("$ref").as[JsString].value
          val resolved = resolveSharedResponse(ref)
          require(resolved.isDefined, s"Could not resolve shared response ${ref}")
          //give inline shape a custom id so there aren't conflicts
          val newSchema = resolved.get.schema.map(s => s.asInstanceOf[Definition].copy(id = IdGenerator.inlineDefinition))
          Response(statusAsInt, resolved.get.contentType, newSchema)
        } else {
          val bodyOption = new Helpers.OAS3Content(content).reduceToFirstBody

          if (bodyOption.isDefined) {
            val schema = bodyOption.get.schema
            val inlineSchema = Definition(schema, IdGenerator.inlineDefinition)(buildContext(schema))
            Response(statusAsInt, Some(bodyOption.get.contentType), Some(inlineSchema))
          } else {
            Response(statusAsInt, None, None)
          }
        }
      }}
  }

  lazy val definitions: Vector[NamedDefinition] = {
    (root \ "components" \ "schemas").getOrElse(JsObject.empty).as[JsObject].value.toVector.map {
      case (name, schema) => {
        NamedDefinition(name, schema.as[JsObject], IdGenerator.definition(name))(buildContext(schema))
      }
    }
  }

  private object Helpers {
    case class OAS3Param(jsObject: JsObject) {

      private val parameterDefinition = {
        if ((jsObject \ "$ref").isDefined) {
          val ref = (jsObject \ "$ref").get.as[JsString].value
          JSONReference.walk(ref, root).get
        } else {
          jsObject
        }
      }

      def in = (parameterDefinition \ "in").get.as[JsString].value
      def name = (parameterDefinition \ "name").get.as[JsString].value
      def required = (parameterDefinition \ "required").getOrElse(JsBoolean(true)).as[JsBoolean].value

      def isPathParameter = in == "path"
      def isBodyParameter = in == "body"
      def isHeaderParameter = in == "header"
      def isQueryParameter = in == "query"

      def schema = (parameterDefinition \ "schema").getOrElse(JsObject.empty).as[JsObject]
    }

    def distinctBy[A, B](xs: List[A])(f: A => B): List[A] =
      scala.reflect.internal.util.Collections.distinctBy(xs)(f)

    case class OAS3ContentBody(contentType: String, schema: JsObject)

    case class OAS3Content(jsObject: JsObject) {
      def reduceToFirstBody: Option[OAS3ContentBody] = {
        if (jsObject.value.nonEmpty) {
          //sort w/ preference towards json
          val head = jsObject.value.toSeq.minBy(_._1 != "application/json")
          Some(OAS3ContentBody(head._1, (head._2 \ "schema").as[JsObject]))
        } else {
          None
        }
      }
    }

  }

  override def sharedResponses: Vector[SharedResponse] = ???
}