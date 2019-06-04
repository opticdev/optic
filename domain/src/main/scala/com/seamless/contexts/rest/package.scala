package com.seamless.contexts

package object rest {

  object HttpMethods {

    sealed trait HttpMethod {
      def hasRequestBody = false
    }

    case object GET extends HttpMethod
    case object POST extends HttpMethod {override def hasRequestBody = true}
    case object PUT extends HttpMethod {override def hasRequestBody = true}
    case object PATCH extends HttpMethod {override def hasRequestBody = true}
    case object DELETE extends HttpMethod
    case object HEAD extends HttpMethod
    case object OPTIONS extends HttpMethod

  }

  case class ContentType(raw: String) {
    def hasSchema: Boolean = {
      val schemaTypes = Set(
        "application/json"
      )

      schemaTypes.exists(_.startsWith(raw))
    }
  }

  object ContentTypes {
    val `application/json` = ContentType("application/json")
  }

}
