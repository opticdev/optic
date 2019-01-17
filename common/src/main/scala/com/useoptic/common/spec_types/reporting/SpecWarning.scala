package com.useoptic.common.spec_types.reporting

sealed trait SpecWarning {
  def message: String
  def isKnownLimitation: Boolean = false
}
sealed trait ProductLimitation extends SpecWarning {
  override def isKnownLimitation: Boolean = true
}

//Endpoint Issue
sealed trait EndpointIssue extends SpecWarning

case object NoFailureCases extends EndpointIssue {
  override def message: String = "There are no failure cases documented for this endpoint. Consider writing additional tests"
}
case object NoSuccessCases extends EndpointIssue {
  override def message: String = "There are no success cases documented for this endpoint. Consider writing additional tests"
}

case class UnableToParseBody(contentType: String) extends ProductLimitation with EndpointIssue {
  override def message: String = s"Optic doesn't know how to handle ${contentType} yet. This is a known issue and will be handled soon"
}

//Project Issue
sealed trait ProjectIssue extends SpecWarning

case object NoAuthentication extends ProjectIssue {
  override def message: String = "There is no authentication scheme defined in your optic.yml file"
}

case class NoObservationsForPath(path: String) extends ProjectIssue {
  override def message: String = s"A path listed in your optic.yml file had no tests so it was not included in the API Spec. Path: '${path}'"
}