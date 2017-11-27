package com.opticdev.server.storage

import com.opticdev.server.storage.ServerStorage
import org.scalatest.{BeforeAndAfterAll, BeforeAndAfterEach, FunSpec}
import play.api.libs.json.{JsObject, JsString, Json}

class ServerStorageSpec extends FunSpec with BeforeAndAfterEach {

  val samplePrefs = JsObject(
    Seq("projects" -> JsObject(
      Seq("projectA" -> JsString("/path/to/projectA"))
    ))
  )

  override def beforeEach(): Unit = {
    ServerStorage.prefFile.write(samplePrefs.toString())
  }

  it("can load data") {
    assert(ServerStorage.reload == ServerStorage(Map("projectA" -> "/path/to/projectA")))
  }

  it("can save data") {
    val serverStorage = ServerStorage.save(ServerStorage(Map("projectB" -> "/path/to/projectB")))
    assert(serverStorage.contentAsString == """{"projects":{"projectB":"/path/to/projectB"}}""")
  }

  it("will save a blank pref object when one does not exist") {
    ServerStorage.prefFile.delete(true)
    assert(ServerStorage.reload == ServerStorage())
    assert(ServerStorage.prefFile.exists)
  }

}
