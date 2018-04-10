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
    DataDirectoryConfig.readConfigStatus == DataDirectoryConfig.ConfigStatus(BuildInfo.opticMDVersion)
  }

  it("can write new config status to data directory") {
    DataDirectoryConfig.configLocation.delete(true)
    DataDirectoryConfig.saveConfigStatus(DataDirectoryConfig.ConfigStatus("ABC"))
    DataDirectoryConfig.readConfigStatus == DataDirectoryConfig.ConfigStatus("ABC")
  }

  describe("can migrate data directory") {

    def stagedMigration =  {
      DataDirectory.init
      DataDirectoryConfig.saveConfigStatus(DataDirectoryConfig.ConfigStatus("0.1.0"))
      (DataDirectory.markdownCache / "testFile").createIfNotExists()
    }

    it("when optic markdown version changes") {
      stagedMigration
      DataDirectoryConfig.triggerMigration
      assert(DataDirectory.markdownCache.list.isEmpty)
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
