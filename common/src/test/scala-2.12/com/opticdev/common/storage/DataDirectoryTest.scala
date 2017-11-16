package com.opticdev.common.storage

import better.files.File
import org.scalatest.FunSpec

class DataDirectoryTest extends FunSpec {

  describe("Data directory manager") {

    it("can clear the directory") {
      DataDirectory.delete
      assert(PlatformConstants.dataDirectory.notExists)
    }

    describe("can detect invalid structure") {
      it("when empty") {
        assert(!DataDirectory.hasValidStructure)
      }

      it("when a folder is missing") {
        DataDirectory.root.createIfNotExists(asDirectory = true)
        DataDirectory.packages.createIfNotExists(asDirectory = true)
        DataDirectory.compiled.createIfNotExists(asDirectory = true)
        assert(!DataDirectory.hasValidStructure)
      }

    }

    it("can create the directory with valid structure") {
      DataDirectory.delete
      DataDirectory.buildDirectoryStructure
      assert(DataDirectory.hasValidStructure)
    }

  }


}
