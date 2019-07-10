package com.seamless.document.domain_docs

import com.seamless.document._
import com.seamless.document.DocBuilder

class Events extends DocBuilder("events.md") {

  def getEventDesc(key: String) = {
    Map(
      "ChildOccurrenceUpdated" -> "Marks a shape is optional in the context of its parent",
      "ConceptDefined" -> "Adds a new concept with the specified name",
      "ConceptDeprecated" -> "Tags a concept as deprecated.",
      "ConceptNamed" -> "Changes the name of a concept",
      "FieldAdded" -> "Adds a field to an object shape",
      "FieldNameChanged" -> "Changes the name of a field",
      "FieldRemoved" -> "Removes a field",
      "InlineConceptDefined" -> "Defines an inline concept (concepts without names that can't be referenced)",
      "TypeAssigned" -> "Changes the type to the assigned type",
      "TypeParameterAdded" -> "Adds a type parameter",
      "TypeParameterRemoved" -> "Removes a type parameter",

      "PathComponentAdded" -> "Adds a new component to path tree",
      "PathComponentRenamed" -> "Renames a path component",
      "PathComponentRemoved" -> "Removes a path component",
      "PathParameterAdded" -> "Adds a path parameter component to path tree",
      "PathParameterShapeSet" -> "Changes the shape of a path parameter",
      "PathParameterRenamed" -> "Renames a path parameter",
      "PathParameterRemoved" -> "Removes a path parameter",
      "RequestParameterAdded" -> "Adds a parameter to a request",
      "RequestParameterRenamed" -> "Renames a parameter",
      "RequestParameterShapeSet" -> "Changes the shape of a parameter",
      "RequestParameterShapeUnset" -> "Unsets the shape of the parameter",
      "RequestParameterRemoved" -> "Removes a parameter from its request",
      "RequestAdded" -> "Adds a new request to a path",
      "RequestBodySet" -> "Adds a request body to a request",
      "RequestBodyUnset" -> "Removes a request body from a path",
      "RequestRemoved" -> "Removes a request",
      "ResponseAdded" -> "Adds a response to a request",
      "ResponseStatusCodeSet" -> "Changes the status code of a response",
      "ResponseBodySet" -> "Adds a response body",
      "ResponseBodyUnset" -> "Removes a response's body",
      "ResponseRemoved" -> "Removes a response from a request",

      "APINamed" -> "Changes the APIs name",
      "ContributionAdded" -> "Adds meta information about the API by ID and Key"
    ).get(key)
  }


  h1("Events")
  p("")


  h2("Requests Domain")
  requestEvents.sortBy(_.name).foreach { case event =>
    h3(event.name)
    p(getEventDesc(event.name).get)
    argsFrom(event.args)
  }


  h2("Data Types Domain")
  dataTypesEvents.sortBy(_.name).foreach { case event =>
    h3(event.name)
    p(getEventDesc(event.name).get)
    argsFrom(event.args)
  }


  h2("API Domain")
  rfcEvents.sortBy(_.name).foreach { case event =>
    h3(event.name)
    p(getEventDesc(event.name).get)
    argsFrom(event.args)
  }
}


object Events {
  def main(args: Array[String]): Unit = {
    println(new Events().toString)
  }
}