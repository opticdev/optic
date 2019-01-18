package com.useoptic.common.spec_types.diff

import com.useoptic.common.spec_types.{Endpoint, Parameter, RequestBody, Response}
import DiffUtils._

object Differs {

  def diffEndpoints(previous: Vector[Endpoint], current: Vector[Endpoint]) = {
    val diff = keyDiff(previous.toSet, current.toSet)(i => i.id)

    val removed = diff.removed.map(RemovedEndpoint()(_))
    val added = diff.added.map(AddedEndpoint()(_))
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
      if (previous.get.contentType != current.get.contentType) set.add(UpdatedRequestBodyContentType(current.get.contentType))
      if (previous.get.schema != current.get.schema) set.add(UpdatedRequestBodySchema(current.get.schema))
      set.toSet
    } else if (previous.isEmpty && current.isDefined) {
      Set(AddedRequestBody(current.get.contentType, current.get.schema))
    } else if (previous.isDefined && current.isEmpty) {
      Set(RemovedRequestBody())
    } else Set()
  }

  def diffParameters(previous: Vector[Parameter], current: Vector[Parameter])(implicit endpointId: String): Set[APISpecChanges] = {

    def diffIn(in: String) = {
      val diff = keyDiff(
        previous.filter(_.in == in).toSet,
        current.filter(_.in == in).toSet)(i => i.name)

      diff.added.map(name => AddedParameter(in, name)) ++
      diff.removed.map(name => RemovedParameter(in, name)) ++
      diff.same.flatMap(name => compare(in, name))
    }

    def compare(in: String, name: String): Seq[UPDATE] = {
      val prev = previous.find(i => i.in == in && i.name == name).get
      val curr = current.find(i => i.in == in && i.name == name).get

      if (prev.required != curr.required && prev.schema != curr.schema) {
        Vector(
          UpdatedParameterRequire(in, name, curr.required),
          UpdatedParameterSchema(in, name, curr.schema)
        )
      } else if (prev.required != curr.required) {
        Vector(UpdatedParameterRequire(in, name, curr.required))
      } else if (prev.schema != curr.schema) {
        Vector(UpdatedParameterSchema(in, name, curr.schema))
      } else {
        Vector()
      }

    }

    diffIn("query") ++ diffIn("header") ++ diffIn("cookie")
  }


  def diffResponses(previous: Vector[Response], current: Vector[Response])(implicit endpointId: String) = {
    val diff = keyDiff(previous.toSet, current.toSet)(i => i.status)
    val removed = diff.removed.map(RemovedResponse(_))
    val added = diff.added.map(AddedResponse(_))

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
      case AddedParameter(in, name) => AddedResponseHeader(status, name)
      case RemovedParameter(in, name) => RemovedResponseHeader(status, name)
      case UpdatedParameterRequire(in, name, isRequired) => UpdatedResponseHeaderRequire(status, name, isRequired)
      case UpdatedParameterSchema(in, name, schema) => UpdatedResponseHeaderSchema(status, name, schema)
    }.foreach(set.add)

    if (previous.schema != current.schema) {
      set.add(UpdatedResponseSchema(status, current.schema))
    }

    if (previous.contentType != current.contentType && current.contentType.isDefined) {
      set.add(UpdatedResponseContentType(status, current.contentType.get))
    }

    set.toSet
  }


}
