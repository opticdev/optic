package com.opticdev.core.sourcegear.project.config

import com.opticdev.common.{PackageRef, SchemaRef}
import com.opticdev.core.sourcegear.graph.objects.ObjectNode
import com.opticdev.core.utils.VectorDistinctBy
import net.jcazevedo.moultingyaml.YamlString

package object options {

  //Project File Interfaces

  case class ProjectFileInterface(
  //core settings
  name: String,
  parsers: Option[List[String]],
  skills: Option[List[PackageRef]],
  connected_projects: Option[List[String]],
  exclude: Option[List[String]],

  //configuration
  objects: Option[List[ConstantObject]],
  defaults: Option[Map[SchemaRef, DefaultSettings]],

  //specify secondary project file paths
  use: Option[List[String]])


  case class SecondaryProjectFileInterface(
  objects: Option[List[ConstantObject]],
  defaults: Option[Map[SchemaRef, DefaultSettings]])


  case class CombinedInterface(primary: ProjectFileInterface, secondary: Seq[SecondaryProjectFileInterface]) {
    //last declared name wins
    lazy val objects: Vector[ObjectNode] = {
      val o = (primary.objects.getOrElse(List()) ++ secondary.flatMap(_.objects).flatten).map(_.toObjectNode).toVector
      VectorDistinctBy.distinctBy(o)(i => i.name)
    }

    //last declared schema ref wins
    lazy val defaults: Map[SchemaRef, DefaultSettings] = {
      primary.defaults.getOrElse(Map.empty) ++ secondary.flatMap(_.defaults).flatten.toMap
    }

  }

  //Exceptions
  case class ProjectFileException(err: String) extends Exception {
    override def getMessage: String = "Error Parsing Project File: "+ err
  }

}

