package com.useoptic.diff.shapes

import com.useoptic.contexts.shapes.ShapesHelper.{BooleanKind, CoreShapeKind, ListKind, NullableKind, NumberKind, ObjectKind, StringKind}
import com.useoptic.types.capture.JsonLike

object JsonToCoreShape {
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
}
