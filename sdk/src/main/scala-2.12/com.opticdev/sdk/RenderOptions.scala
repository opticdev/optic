package com.opticdev.sdk

case class RenderOptions(gearId: Option[String] = None,
                         containers: Option[ContainersContent] = None,
                         variables: Option[VariableMapping] = None) {

  def mergeWith(other: RenderOptions): RenderOptions = RenderOptions(
    gearId = {
      if (this.gearId.isEmpty) {
        other.gearId
      } else if (this.gearId.isDefined && other.gearId.isEmpty) {
        this.gearId
      } else {
        other.gearId
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

  def isEmpty = gearId.isEmpty && containers.isEmpty && variables.isEmpty
}