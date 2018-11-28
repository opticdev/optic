package com.opticdev.core.sourcegear.project.config

import com.opticdev.common.{PackageRef, SchemaRef}
import com.opticdev.core.sourcegear.graph.objects.ObjectNode
import com.opticdev.core.utils.VectorDistinctBy
import net.jcazevedo.moultingyaml.YamlString

import scala.util.Try

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


  case class CombinedInterface(primaryTry: Try[ProjectFileInterface], secondaryTry: List[Try[SecondaryProjectFileInterface]], fserrors: List[String]) {

    val primary: ProjectFileInterface = primaryTry.getOrElse(ProjectFileInterface("Unknown Name", None, None, None, None, None, None, None))
    val secondary: Seq[SecondaryProjectFileInterface] = secondaryTry.collect{case s if s.isSuccess => s.get}

    //last declared name wins
    lazy val objects: Vector[ObjectNode] = {
      val o = (primary.objects.getOrElse(List()) ++ secondary.flatMap(_.objects).flatten).map(_.toObjectNode).toVector
      VectorDistinctBy.distinctBy(o)(i => i.name)
    }

    //last declared schema ref wins
    lazy val defaults: Map[SchemaRef, DefaultSettings] = {
      primary.defaults.getOrElse(Map.empty) ++ secondary.flatMap(_.defaults.getOrElse(Map.empty))
    }

    val errors: List[String] = {
      val primaryError = primaryTry.failed.map(_.getMessage).toOption
      val secondaryErrors = secondaryTry.collect{case s if s.isFailure => s.failed.get.getMessage}

      if (primaryError.isDefined) {
        primaryError.get +: secondaryErrors
      } else secondaryErrors
    } ++ fserrors

    def isSuccess: Boolean = primaryTry.isSuccess && secondaryTry.forall(_.isSuccess)
    def isPartialSuccess: Boolean = primaryTry.isSuccess
    def isFailure: Boolean = !isSuccess && !isPartialSuccess

  }

  //Exceptions
  case class ProjectFileException(err: String) extends Exception {
    override def getMessage: String = err
  }

}

