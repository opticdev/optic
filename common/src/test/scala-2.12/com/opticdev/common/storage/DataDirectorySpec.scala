package com.opticdev.common.storage

import better.files.File
import com.opticdev.common.PlatformConstants
import org.scalatest.FunSpec

class DataDirectorySpec extends FunSpec {

  it("can clear the directory") {
    DataDirectory.delete
    assert(PlatformConstants.dataDirectory.notExists)
  }

  it("can init when missing or corrupt") {
    DataDirectory.delete
    DataDirectory.init
    assert(DataDirectory.hasValidStructure)
  }

  describe("can detect invalid structure") {
    it("when empty") {
      DataDirectory.root.list.foreach(_.delete(true))
      assert(!DataDirectory.hasValidStructure)
    }

    it("when a folder is missing") {
      DataDirectory.delete
      DataDirectory.root.createIfNotExists(asDirectory = true)
      DataDirectory.packages.createIfNotExists(asDirectory = true)
      DataDirectory.compiled.createIfNotExists(asDirectory = true)
      assert(!DataDirectory.hasValidStructure)
    }

  }
  
}
