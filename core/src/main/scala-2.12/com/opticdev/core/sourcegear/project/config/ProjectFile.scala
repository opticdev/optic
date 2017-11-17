package com.opticdev.core.sourcegear.project.config

import java.nio.file.NoSuchFileException

import better.files.File
import com.opticdev.common.PackageRef
import com.opticdev.core.sourcegear.InvalidProjectFileException
import com.opticdev.parsers.utils.Crypto
import org.yaml.snakeyaml.parser.ParserException

import scala.util.Try

class ProjectFile(val file: File, createIfDoesNotExist : Boolean = true, onChanged: (ProjectFile)=> Unit = (pf)=> {}) extends PFInterface {
  import net.jcazevedo.moultingyaml._

  private var interfaceStore : PFRootInterface = interfaceForFile

  //create a blank one if it does not exist
  if (createIfDoesNotExist && !file.exists) {
    save
  }

  private var lastHash : String = null
  private def interfaceForFile = {
    val (yaml, contents) = {
      val tryParse = Try({
        val contents = file.contentAsString
        (contents.parseYaml.asYamlObject, contents)
      })
      if (tryParse.isSuccess) tryParse.get
      else {
        tryParse.failed.get match {
          case e:NoSuchFileException => if (createIfDoesNotExist) (YamlObject(), "") else throw InvalidProjectFileException("file not found")
          case e:ParserException => throw InvalidProjectFileException("syntax error in YAML")
          case _ => throw InvalidProjectFileException("unknown error")
        }
      }
    }

    val name = PFFieldInterface.forKey[YamlString]("name", YamlString("Unnamed Project"), yaml)

    val parsers =PFListInterface.forKey[YamlString]("parsers", YamlArray(Vector()), yaml)

    val knowledge =PFListInterface.forKey[YamlString]("knowledge", YamlArray(Vector()), yaml)

    val ignored_files =PFListInterface.forKey[YamlString]("ignored_files", YamlArray(Vector()), yaml)

    lastHash = Crypto.createSha1(contents)
    //      val relationships =PFListInterface.forKey[YamlString]("relationships", YamlArray(Vector()), yaml)
    PFRootInterface(name, parsers, knowledge, ignored_files)
  }

  def interface = interfaceStore
  def reload = {
    if (file.exists && Crypto.createSha1(file.contentAsString) != lastHash) {
      val parseTry = Try(interfaceForFile)
      if (parseTry.isSuccess) {
        interfaceStore = parseTry.get
      }
    } else if (file.notExists && createIfDoesNotExist) {
      interfaceStore = interface
      save
    }

    onChanged(this)
  }


  override def yamlValue: YamlValue = {
    val obj : Map[YamlValue, YamlValue] = Map(
      YamlString("name") -> interface.name.yamlValue,
      YamlString("parsers") -> interface.parsers.yamlValue,
      YamlString("knowledge") -> interface.knowledge.yamlValue,
      YamlString("ignored_files") -> interface.ignored_files.yamlValue
//      YamlString("relationships") -> relationships.yamlValue
    )

    YamlObject(obj)
  }

  def save = file.createIfNotExists(asDirectory = false).write(yamlValue.prettyPrint)

  def dependencies = Try[Vector[PackageRef]] {
    val dependencies = interface.knowledge.value.map(i=> (PackageRef.fromString(i.value), i))

    val allValid = dependencies.forall(_._1.isSuccess)

    if (allValid) {

      val unwrappedDependencies = dependencies.map(i=> (i._1.get, i._2.value))

      //guaranteed success
      val groupedByPackageId = unwrappedDependencies.groupBy(_._1.packageId)
      val duplicates = groupedByPackageId.filter(_._2.size > 1)

      if (duplicates.nonEmpty) {
        throw new Error("Some packages are defined multiple times: ["+ duplicates.keys.mkString(", ")+"]")
      }

      unwrappedDependencies.map(_._1).toVector.sortBy(_.full)

    } else {
      throw new Error("Some packages are not valid: ["+dependencies.filter(_._1.isFailure).map(_._2.value).mkString(", ")+"]")
    }

  }

}