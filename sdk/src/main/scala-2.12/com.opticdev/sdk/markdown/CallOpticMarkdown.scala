package com.opticdev.sdk.markdown

import better.files.File
import com.opticdev.common.storage.DataDirectory
import com.opticdev.common.PlatformConstants
import net.jcazevedo.moultingyaml.YamlString
import play.api.libs.json.{JsObject, Json}

import scala.util.{Failure, Success, Try}
import sys.process._
import net.jcazevedo.moultingyaml._

case object CallOpticMarkdown {

  def scriptPath = {
    val path = System.getProperty("opticmdbinary")
    if (path != null) {
      path
    } else {
      Try({
        val contents = File("config.yml").contentAsString
        contents.parseYaml.asYamlObject.fields(YamlString("testOpticMarkdown")).asInstanceOf[YamlString].value
      }).getOrElse(throw new Error("No opticmarkdown found in config.yml"))
    }
  }

  lazy val script = File(scriptPath)

  def version: String = {
    val cmd = Seq(script.pathAsString, "--version")
    cmd.!!(ProcessLogger(stdout append _, stderr append _)).trim
  }

  def parseFile(filePath: String) : JsObject = {
    val cmd = Seq(script.pathAsString, filePath)
    val result = cmd.!!(ProcessLogger(stdout append _, stderr append _))
    Json.parse(result).as[JsObject]
  }

  def parseString(contents: String) : JsObject = {
    val cmd = Seq(script.pathAsString, "--raw", contents)
    val result = cmd.!!(ProcessLogger(stdout append _, stderr append _))
    Json.parse(result).as[JsObject]
  }
}
