package com.opticdev.core.sourcegear.storage

import java.io.FileNotFoundException

import better.files.File
import com.opticdev.common.storage.DataDirectory
import play.api.libs.json.{JsArray, JsObject, Json}

import scala.util.{Failure, Try}

object ConnectedProjectGraphStorage {

  def writeToStorage(name: String, json: JsArray): File = {
    val file = DataDirectory.projectGraphs / name  createIfNotExists(asDirectory = false)
    file.write(json.toString())
  }

  def loadFromStorage(name: String) : Try[JsArray] = {
    val file = DataDirectory.projectGraphs / name
    if (file.exists) {
      Try(Json.parse(file.contentAsString).as[JsArray])
    } else {
      Failure(new FileNotFoundException())
    }
  }

}
