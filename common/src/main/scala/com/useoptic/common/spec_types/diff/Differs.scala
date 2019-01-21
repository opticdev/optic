package com.useoptic.common.spec_types.diff

import com.useoptic.common.spec_types.{Endpoint, Parameter, RequestBody, Response}
import DiffUtils._

object Differs {

  def diffEndpoints(previous: Vector[Endpoint], current: Vector[Endpoint]) = {
    val diff = keyDiff(previous.toSet, current.toSet)(i => i.id)

    val removed = diff.removed.map(RemovedEndpoint)
    val added = diff.added.map(AddedEndpoint)
    val same = diff.same.flatMap{ case id =>
        val p = previous.find(_.id == id).get
        val c = current.find(_.id == id).get
        diffEndpoint(p, c)
    }

    removed ++ added ++ same
  }

  def diffEndpoint(previous: Endpoint, current: Endpoint) = {
    implicit val endpointId = current.id
    diffParameters(previous.parameters, current.parameters) ++
    diffBody(previous.body, current.body) ++
    diffResponses(previous.responses, current.responses)
  }

  def diffBody(previous: Option[RequestBody], current: Option[RequestBody])(implicit endpointId: String): Set[APISpecChanges] = {
    if (previous.isDefined && current.isDefined) {
      val set = collection.mutable.Set[APISpecChanges]()
      if (previous.get.contentType != current.get.contentType) set.add(UpdatedRequestBodyContentType(current.get.contentType, endpointId))
      if (previous.get.schema != current.get.schema) set.add(UpdatedRequestBodySchema(current.get.schema, endpointId))
      set.toSet
    } else if (previous.isEmpty && current.isDefined) {
      Set(AddedRequestBody(current.get.contentType, current.get.schema, endpointId))
    } else if (previous.isDefined && current.isEmpty) {
      Set(RemovedRequestBody(endpointId))
    } else Set()
  }

  def diffParameters(previous: Vector[Parameter], current: Vector[Parameter])(implicit endpointId: String): Set[APISpecChanges] = {

    def diffIn(in: String) = {
      val diff = keyDiff(
        previous.filter(_.in == in).toSet,
        current.filter(_.in == in).toSet)(i => i.name)

      diff.added.map(name => AddedParameter(in, name, endpointId)) ++
      diff.removed.map(name => RemovedParameter(in, name, endpointId)) ++
      diff.same.flatMap(name => compare(in, name))
    }

    def compare(in: String, name: String): Seq[UPDATE] = {
      val prev = previous.find(i => i.in == in && i.name == name).get
      val curr = current.find(i => i.in == in && i.name == name).get

      if (prev.required != curr.required && prev.schema != curr.schema) {
        Vector(
          UpdatedParameterRequire(in, name, curr.required, endpointId),
          UpdatedParameterSchema(in, name, curr.schema, endpointId)
        )
      } else if (prev.required != curr.required) {
        Vector(UpdatedParameterRequire(in, name, curr.required, endpointId))
      } else if (prev.schema != curr.schema) {
        Vector(UpdatedParameterSchema(in, name, curr.schema, endpointId))
      } else {
        Vector()
      }

    }

    diffIn("query") ++ diffIn("header") ++ diffIn("cookie")
  }


  def diffResponses(previous: Vector[Response], current: Vector[Response])(implicit endpointId: String) = {
    val diff = keyDiff(previous.toSet, current.toSet)(i => i.status)
    val removed = diff.removed.map(i => RemovedResponse(i, endpointId))
    val added = diff.added.map(i => AddedResponse(i, endpointId))

    val sameDiffs = diff.same.flatMap { case status =>
        val p = previous.find(_.status == status).get
        val c = current.find(_.status == status).get
        diffResponse(p, c)
    }

    removed ++ added ++ sameDiffs
  }

  def diffResponse(previous: Response, current: Response)(implicit endpointId: String): Set[APISpecChanges] = {
    val set = collection.mutable.Set[APISpecChanges]()
    val status = current.status

    val headerChanges = diffParameters(previous.headers, current.headers).collect {
      case AddedParameter(in, name, endpointId) => AddedResponseHeader(status, name, endpointId)
      case RemovedParameter(in, name, endpointId) => RemovedResponseHeader(status, name, endpointId)
      case UpdatedParameterRequire(in, name, isRequired, endpointId) => UpdatedResponseHeaderRequire(status, name, isRequired, endpointId)
      case UpdatedParameterSchema(in, name, schema, endpointId) => UpdatedResponseHeaderSchema(status, name, schema, endpointId)
    }.foreach(set.add)

    if (previous.schema != current.schema) {
      set.add(UpdatedResponseSchema(status, current.schema, endpointId))
    }

    if (previous.contentType != current.contentType && current.contentType.isDefined) {
      set.add(UpdatedResponseContentType(status, current.contentType.get, endpointId))
    }

    set.toSet
  }


}
