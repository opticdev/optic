package com.useoptic.diff.shapes.resolvers

import com.useoptic.contexts.shapes.ShapesHelper._
import com.useoptic.diff.interactions.{BodyUtilities, InteractionTrail, RequestBody, ResponseBody}
import com.useoptic.diff.shapes.JsonTrail
import com.useoptic.diff.shapes.JsonTrailPathComponent.{JsonArray, JsonArrayItem, JsonObject, JsonObjectKey}
import com.useoptic.types.capture.{HttpInteraction, JsonLike}
import io.circe.Json

object JsonLikeResolvers {
  def jsonToCoreKind(jsonLike: JsonLike): CoreShapeKind = {
    jsonLike match {
      case a if a.isArray => ListKind
      case a if a.isObject => ObjectKind
      case a if a.isString => StringKind
      case a if a.isNumber => NumberKind
      case a if a.isBoolean => BooleanKind
      case a if a.isNull => NullableKind
    }
  }

  def tryResolveJson(interactionTrail: InteractionTrail, jsonTrail: JsonTrail, interaction: HttpInteraction): Option[Json] = {
    tryResolveJsonLike(interactionTrail, jsonTrail, interaction).map(_.asJson)
  }

  def tryResolveJsonLike(interactionTrail: InteractionTrail, jsonTrail: JsonTrail, interaction: HttpInteraction): Option[JsonLike] = {
    interactionTrail.path.last match {
      case t: ResponseBody => {
        tryResolveJsonTrail(jsonTrail, BodyUtilities.parseBody(interaction.response.body))
      }
      case t: RequestBody => {
        tryResolveJsonTrail(jsonTrail, BodyUtilities.parseBody(interaction.request.body))
      }
      case _ => throw new Error("expected interaction trail to be either a request body or response body")
    }
  }

  def tryResolveJsonTrail(jsonTrail: JsonTrail, jsonOption: Option[JsonLike]): Option[JsonLike] = {
    if (jsonOption.isEmpty) {
      return None
    }

    if (jsonTrail.path.isEmpty) {
      return jsonOption
    }

    val json = jsonOption.get

    jsonTrail.path.head match {
      case JsonObject() => tryResolveJsonTrail(jsonTrail.withoutParent(), jsonOption)
      case JsonArray() => tryResolveJsonTrail(jsonTrail.withoutParent(), jsonOption)
      case JsonObjectKey(key) => {
        if (json.isObject) {
          tryResolveJsonTrail(jsonTrail.withoutParent(), json.fields.get(key))
        } else {
          None
        }
      }
      case JsonArrayItem(index) => {
        if (json.isArray) {
          val array = json.items
          val item = array.lift(index)
          tryResolveJsonTrail(jsonTrail.withoutParent(), item)
        } else {
          None
        }
      }
    }
  }
}
