package com.opticdev.core.sourcegear.project.config

import java.nio.file.NoSuchFileException

import better.files.File
import com.opticdev.common.{PackageRef, ParserRef, SchemaRef}
import com.opticdev.core.sourcegear.InvalidProjectFileException
import com.opticdev.core.sourcegear.graph.objects.ObjectNode
import com.opticdev.core.sourcegear.project.config.options.{CombinedInterface, ConfigYamlProtocol, DefaultSettings, ProjectFileInterface}
import com.opticdev.parsers.utils.Crypto
import org.yaml.snakeyaml.parser.ParserException

import scala.util.Try
import scala.util.hashing.MurmurHash3

class ProjectFile(val file: File, onChanged: (ProjectFile)=> Unit = (pf)=> {}) {
  import net.jcazevedo.moultingyaml._

  private var interfaceStore : Try[CombinedInterface] = interfaceForFile

  private def interfaceForFile: Try[CombinedInterface] = Try {
    val contents = file.contentAsString
    val parsed = ConfigYamlProtocol.parsePrimary(contents)

    val secondaryProjectFiles = parsed.get.use.getOrElse(List()).map{
      case f => file.parent / f
    }.collect {
      case f if f.exists => {
        ConfigYamlProtocol.parseSecondary(f.contentAsString)
      }
      case f => throw new InvalidProjectFileException("Failed to load secondary project file: "+f)
    }

    CombinedInterface(parsed.get, secondaryProjectFiles.collect{case spf if spf.isSuccess => spf.get })
  }

  def interface = interfaceStore

  def reload = {
    if (file.exists) {
      interfaceStore = interfaceForFile
      onChanged(this)
    }
  }

  //interface

  def name = Try(interface.get.primary.name).toOption

  def dependencies: Try[Vector[PackageRef]] = Try {

    val skills = interface.get.primary.skills.getOrElse(List.empty)

    val duplicates = skills.groupBy(_.packageId).filter(_._2.size > 1)
    require(duplicates.isEmpty, "Duplicate packages not allowed: "+duplicates.keys.mkString(", "))

    skills.toVector
  }

  def parsers: Vector[ParserRef] = Try {
    interface.get.primary.parsers.get.map(i=> ParserRef(i)).toVector
  }.getOrElse(Vector.empty)

  def connected_projects: Set[String] = Try {
    interface.get.primary.connected_projects.get.toSet
  }.getOrElse(Set.empty[String])


  def objects: Try[Vector[ObjectNode]] = interface.map(_.objects)
  def defaults: Try[Map[SchemaRef, DefaultSettings]] = interface.map(_.defaults)

  def hash: String = Integer.toHexString({
    MurmurHash3.stringHash(name.getOrElse("")) ^
    MurmurHash3.stringHash(file.parent.pathAsString) ^
      MurmurHash3.setHash(dependencies.getOrElse(Vector.empty).map(_.full).toSet) ^
      MurmurHash3.setHash(parsers.map(_.full).toSet) ^
      MurmurHash3.setHash( //hashed contents of secondary config files
        interface.map(_.primary.use.getOrElse(List())).getOrElse(List())
            .map(file.parent / _)
            .collect{case f if f.exists => f.md5}
            .toSet)
  })

  def fileUpdateTriggersReload(targetFile: File): Boolean = {
    val isProjectFile = targetFile.isSameFileAs(file)

    val isSecondaryProjectFile = interface.map(_.primary.use.getOrElse(List())).getOrElse(List())
      .map(file.parent / _)
      .exists(_.isSameFileAs(targetFile))

    isProjectFile || isSecondaryProjectFile
  }

}