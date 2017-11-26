package com.opticdev.server.storage

import better.files._
import com.opticdev.common.storage.DataDirectory
import play.api.libs.json._

import scala.util.Try

case class ServerStorage(projects: Map[String, String] = Map())

object ServerStorage {

  lazy val empty = ServerStorage()

  implicit val serverStorageReads = Json.reads[ServerStorage]
  implicit val serverStorageWrites : Writes[ServerStorage] = (o: ServerStorage) => {
    JsObject(Seq(
      "projects" -> JsObject(o.projects.mapValues(JsString).toSeq)
    ))
  }

  val prefFile : File = DataDirectory.root / "server.json"

  def reload : ServerStorage = {

    val prefTry = Try {
      val jsValue = Json.parse(prefFile.contentAsString)
      Json.fromJson[ServerStorage](jsValue)
    }

    if (prefTry.isSuccess && prefTry.get.isSuccess) {
      prefTry.get.get
    } else {
      save(empty)
      empty
    }
  }

  def save(serverStorage: ServerStorage): File = {
    prefFile.touch()
    val asJson = Json.toJson[ServerStorage](serverStorage)
    prefFile.write(asJson.toString())
  }

}
