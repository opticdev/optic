package com.opticdev.sdk.descriptions.transformation.mutate

import com.opticdev.sdk.VariableMapping
import com.opticdev.sdk.descriptions.transformation.generate.RenderOptions

case class MutationOptions(tags: Option[TagMutations] = None,
                           containers: Option[ContainerMutations] = None,
                           variables: Option[VariableMapping] = None) {

  def mergeWith(other: MutationOptions): MutationOptions = MutationOptions(
    tags = {
      if (this.tags.isEmpty) {
        other.tags
      } else if (this.tags.isDefined && other.tags.isEmpty) {
        this.tags
      } else if (this.tags.isDefined && other.tags.isDefined) {
        Some(this.tags.get ++ other.tags.get)
      } else {
        other.tags
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

}