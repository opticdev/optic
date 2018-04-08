package com.opticdev.sdk

case class RenderOptions(lensId: Option[String] = None,
                         containers: Option[ContainersContent] = None,
                         variables: Option[VariableMapping] = None) {

  def mergeWith(other: RenderOptions): RenderOptions = RenderOptions(
    lensId = {
      if (this.lensId.isEmpty) {
        other.lensId
      } else if (this.lensId.isDefined && other.lensId.isEmpty) {
        this.lensId
      } else {
        other.lensId
      }
    },
    containers = {
      if (this.containers.isEmpty) {
        other.containers
      } else if (this.containers.isDefined && other.containers.isEmpty) {
        this.containers
      } else if (this.containers.isDefined && other.containers.isDefined) {
        Some(this.containers.get ++ other.containers.get)
      } else {
        other.containers
      }
    },
    variables = {
      if (this.variables.isEmpty) {
        other.variables
      } else if (this.variables.isDefined && other.variables.isEmpty) {
        this.variables
      } else if (this.variables.isDefined && other.variables.isDefined) {
        Some(this.variables.get ++ other.variables.get)
      } else {
        other.variables
      }
    }
  )

  def isEmpty = lensId.isEmpty && containers.isEmpty && variables.isEmpty
}