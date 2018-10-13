package com.opticdev.common.storage

import org.scalatest.{BeforeAndAfterAll, FunSpec}
import com.opticdev.common.BuildInfo

class DataDirectoryConfigSpec extends FunSpec with BeforeAndAfterAll {

  override def beforeAll(): Unit = {
    DataDirectory.init
    super.beforeAll()
  }

  it("can read config status from data directory when doesn't exist") {
    DataDirectoryConfig.configLocation.delete(true)
    DataDirectoryConfig.readConfigStatus == DataDirectoryConfig.ConfigStatus(BuildInfo.skillsSDKVersion, Seq())
  }

  it("can write new config status to data directory") {
    DataDirectoryConfig.configLocation.delete(true)
    DataDirectoryConfig.saveConfigStatus(DataDirectoryConfig.ConfigStatus("ABC", Seq()))
    DataDirectoryConfig.readConfigStatus == DataDirectoryConfig.ConfigStatus("ABC", Seq())
  }


  describe("storing last projects") {
    it("no duplicates saved. ") {
      DataDirectoryConfig.configLocation.delete(true)
      DataDirectoryConfig.addKnownProject("one/two/three.yml")
      DataDirectoryConfig.addKnownProject("one/two/three.yml")
      DataDirectoryConfig.addKnownProject("one/two/three.yml")
      DataDirectoryConfig.readConfigStatus.knownProjects == Seq("one/two/three.yml")
    }

    it("last in first out") {
      DataDirectoryConfig.configLocation.delete(true)
      DataDirectoryConfig.addKnownProject("1.yml")
      DataDirectoryConfig.addKnownProject("2.yml")
      DataDirectoryConfig.addKnownProject("3.yml")
      DataDirectoryConfig.addKnownProject("4.yml")
      DataDirectoryConfig.addKnownProject("5.yml")
      DataDirectoryConfig.addKnownProject("6.yml")
      DataDirectoryConfig.addKnownProject("6.yml")
      DataDirectoryConfig.addKnownProject("7.yml")
      assert(DataDirectoryConfig.readConfigStatus.knownProjects == Seq("7.yml", "6.yml", "5.yml", "4.yml", "3.yml", "2.yml"))
    }
  }

  it("will reset data directory if config.json is invalid") {
    val test = DataDirectory.root / "test.isItStillThere"
    test.createIfNotExists()
    DataDirectoryConfig.configLocation.createIfNotExists().write("HELLO WORLD")
    DataDirectoryConfig.readConfigStatus

    assert(!test.exists)
  }

}
