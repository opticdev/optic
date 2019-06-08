package com.seamless.oas.api_guru_interface
import java.net.URL

import sys.process._
import better.files._
import better.files.Dsl._
import io.circe.{Json, ParsingFailure}
import io.circe.yaml.parser
import io.circe.yaml._
import io.circe.yaml.syntax._
import play.api.libs.json.JsObject

import scala.util.Try

object AskAPIGuruAnything {

  val master = "https://github.com/APIs-guru/openapi-directory/archive/master.zip"
  val apiDir = File("src/test/resources/api-guru")
  val downloadAs = apiDir / "tmp.zip"
  val clonedRepo = apiDir / "cloned"
  val apis = clonedRepo / "openapi-directory-master" / "APIs"
  val output = apiDir / "flat"

  def cloneLocal = {

    Try(mkdir(apiDir))
    Try(mkdir(clonedRepo))
    Try(rm(downloadAs))
    Try(rm(output))

    println("Downloading... " + master)
    new URL(master) #> downloadAs.toJava !!

    unzip(downloadAs)(clonedRepo)
  }

  def extractAPIs = {
    println("Walking APIs... " + master)
    Try(mkdir(output))
    apis.list.toVector.map(i => {
      val apiName = i.name
      println("added "+ apiName)

      val spec = i.collectChildren {
        case swagger if swagger.name == "swagger.yaml" => true
        case openapi if openapi.name == "openapi.yaml" => true
        case a => false
      }
      .toVector
      .headOption


      if (spec.isDefined) {
        println(spec.get.name)
        val yamlParsed: Either[ParsingFailure, Json] = parser.parse(spec.get.contentAsString)
        if (yamlParsed.isRight) {
          val f = output / s"${apiName}.json"
          f.createIfNotExists()
          f.write(yamlParsed.right.get.toString())
        }
      }
    })

    Try(rm(downloadAs))
    Try(rm(apis))
  }

  def prepareSpecs: Unit = {
    val contentDownloaded = output.exists && output.isDirectory && output.list.nonEmpty
    if (!contentDownloaded) {
      cloneLocal
      extractAPIs
      Try(rm(downloadAs))
      Try(rm(clonedRepo))

      println(s"\n\n Finished! You can now have ${output.list.size} APIs in your dataset")
    }
  }

  def allSpecs: Vector[(String, JsObject)] = {
    import play.api.libs.json.Json
    output.list.toVector.map( i => {
      (i.name, Json.parse(i.contentAsString).as[JsObject])
    })
  }

}
