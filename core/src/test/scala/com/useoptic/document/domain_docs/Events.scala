package com.useoptic.document.domain_docs

import com.useoptic.document._
import com.useoptic.document.DocBuilder

class Events extends DocBuilder {

  def getEventDesc(key: String) = {
    Map(
      "ChildOccurrenceUpdated" -> "A shape is optional in the context of its parent",
      "ConceptDefined" -> "There is a concept with $name",
      "ConceptDeprecated" -> "A concept has been deprecated",
      "ConceptNamed" -> "A concept has been renamed to $newName",
      "FieldAdded" -> "A field has been added to object",
      "FieldNameChanged" -> "A field has been renamed",
      "FieldRemoved" -> "A field has been removed",
      "InlineConceptDefined" -> "An inline concept has been defined",
      "TypeAssigned" -> "A shape's type has been changed",
      "TypeParameterAdded" -> "A type parameter has been added",
      "TypeParameterRemoved" -> "A type parameter has been removed",

      "PathComponentAdded" -> "A path component has been added",
      "PathComponentRenamed" -> "A path component has been renamed",
      "PathComponentRemoved" -> "A path component has been removed",
      "PathParameterAdded" -> "A path parameter has been added",
      "PathParameterShapeSet" -> "A path parameter shape has been changed",
      "PathParameterRenamed" -> "A path parameter was renamed",
      "PathParameterRemoved" -> "A path parameter was removed",
      "RequestParameterAdded" -> "A request parameter was added",
      "RequestParameterRenamed" -> "A request parameter has been renamed",
      "RequestParameterShapeSet" -> "A request parameter shape has been changed",
      "RequestParameterShapeUnset" -> "A request parameter shape was removed",
      "RequestParameterRemoved" -> "A request parameter has been removed",
      "RequestAdded" -> "A request was added",
      "RequestBodySet" -> "A request body was specified",
      "RequestBodyUnset" -> "A request body was removed",
      "RequestRemoved" -> "A request was removed",
      "ResponseAdded" -> "A response was added to a request",
      "ResponseStatusCodeSet" -> "A response's status code was changed",
      "ResponseBodySet" -> "A response body was specified",
      "ResponseBodyUnset" -> "A response body was removed",
      "ResponseRemoved" -> "A response was removed",

      "APINamed" -> "The API was renamed",
      "ContributionAdded" -> "Meta information was added to an ID and Key"
    ).get(key)
  }

  h3("Requests Domain")
  requestEvents.sortBy(_.name).foreach { case event =>
    h4(event.name)
    p(getEventDesc(event.name).get)
    argsFrom(event.args)
  }


  h3("Data Types Domain")
  shapesEvents.sortBy(_.name).foreach { case event =>
    h4(event.name)
    p(getEventDesc(event.name).get)
    argsFrom(event.args)
  }


//  h2("API Domain")
//  rfcEvents.sortBy(_.name).foreach { case event =>
//    h3(event.name)
//    p(getEventDesc(event.name).get)
//    argsFrom(event.args)
//  }
}


object Events {
  def main(args: Array[String]): Unit = {
    println(new Events().toString)
  }
}
