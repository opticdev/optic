package com.opticdev.sdk.descriptions.transformation.generate

import com.opticdev.sdk.opticmarkdown2.LensRef
import com.opticdev.sdk.{ContainersContent, VariableMapping}


case class RenderOptions(generatorId: Option[String] = None,
                         containers: Option[ContainersContent] = None,
                         variables: Option[VariableMapping] = None,
                         tag: Option[String] = None,
                         inFile: Option[String] = None
                        ) {

  def mergeWith(other: RenderOptions): RenderOptions = RenderOptions(
    generatorId = {
      if (this.generatorId.isEmpty) {
        other.generatorId
      } else if (this.generatorId.isDefined && other.generatorId.isEmpty) {
        this.generatorId
      } else {
        other.generatorId
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
    },
    tag = {
      if (this.tag.isEmpty) {
        other.tag
      } else if (this.tag.isDefined && other.tag.isEmpty) {
        this.tag
      } else {
        other.tag
      }
    },
    inFile = {
      if (this.inFile.isEmpty) {
        other.inFile
      } else if (this.inFile.isDefined && other.inFile.isEmpty) {
        this.inFile
      } else {
        other.inFile
      }
    }
  )

  def lensRef : Option[LensRef] = generatorId.flatMap(i=> LensRef.fromString(i).toOption)

}