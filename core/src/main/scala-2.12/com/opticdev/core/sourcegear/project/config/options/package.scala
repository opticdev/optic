package com.opticdev.core.sourcegear.project.config

import com.opticdev.common.SchemaRef
import net.jcazevedo.moultingyaml.YamlString

package object options {

  case class ProjectFileInterface(
  //core settings
  name: String,
  parsers: Option[List[String]],
  skills: Option[List[String]],
  connectedProjects: Option[List[String]],
  exclude: Option[List[String]],

  //configuration
  objects: Option[List[ConstantObject]],
  defaults: Option[Map[SchemaRef, DefaultSettings]],

  //specify secondary project file paths
  use: Option[List[String]])


  case class SecondaryProjectFileInterface(
  objects: Option[List[ConstantObject]],
  defaults: Option[Map[SchemaRef, DefaultSettings]])

}

