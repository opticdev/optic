package com.useoptic.proxy.collection

import com.useoptic.common.spec_types.Endpoint
import com.useoptic.common.spec_types.reporting.{EndpointIssue, SpecWarning}

class ErrorAccumulator() {

  private val _issues = scala.collection.mutable.ListBuffer[SpecWarning]()
  private val _endpoint_issues = scala.collection.mutable.ListBuffer[(String, SpecWarning)]()


  def add(specWarnings: SpecWarning) =
    _issues.append(specWarnings)

  def add(endpointId: String)(endpointIssue: EndpointIssue) =
    _endpoint_issues.append((endpointId, endpointIssue))

  def forId(id: String): Vector[EndpointIssue] =
    _endpoint_issues.filter(_._1 == id).map(_._2).toVector.asInstanceOf[Vector[EndpointIssue]]
}
