package com.seamless.contexts

import scala.scalajs.js.annotation.{JSExportAll, JSExportDescendentClasses, JSExportDescendentObjects}

package object data_types {

  object Primitives {

    @JSExportDescendentClasses
    @JSExportDescendentObjects
    @JSExportAll
    sealed trait PrimitiveType {
      def id: String
      def hasTypeParameters: Boolean = false
      def hasFields: Boolean = false
      def isRef: Boolean = false
    }

    case object StringT extends PrimitiveType {
      override def id: String = "string"
    }

    case object NumberT extends PrimitiveType {
      override def id: String = "number"
    }

    case object IntegerT extends PrimitiveType {
      override def id: String = "integer"
    }

    case object BooleanT extends PrimitiveType {
      override def id: String = "boolean"
    }

    case object AnyT extends PrimitiveType {
      override def id: String = "any"
    }

    //Collection Types
    case object ObjectT extends PrimitiveType {
      override def id: String = "object"

      override def hasFields: Boolean = true
    }

    case object ListT extends PrimitiveType {
      override def id: String = "list"

      override def hasTypeParameters: Boolean = true
    }

    case object EitherT extends PrimitiveType {
      override def id: String = "either"

      override def hasTypeParameters: Boolean = true
    }

    //Reference Types
    @JSExportAll
    case class RefT(conceptId: String) extends PrimitiveType {
      override def id: String = conceptId

      override def isRef: Boolean = true
    }

    def all: Seq[PrimitiveType] = Seq(
      StringT,
      NumberT,
      IntegerT,
      BooleanT,
      ObjectT,
      ListT,
      AnyT,
    )

  }

}
