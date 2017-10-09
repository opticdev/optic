package com.opticdev.core.sourcegear.project.config

import java.nio.file.NoSuchFileException

import better.files.File
import com.opticdev.core.sourcegear.InvalidProjectFileException
import com.opticdev.parsers.utils.Crypto
import org.yaml.snakeyaml.parser.ParserException

import scala.util.Try

class ProjectFile(val file: File, createIfDoesNotExist : Boolean = true) extends PFInterface {
  import net.jcazevedo.moultingyaml._

  private var interfaceStore : PFRootInterface = interfaceForFile
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

}