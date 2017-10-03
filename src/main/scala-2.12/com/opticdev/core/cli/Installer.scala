package com.opticdev.core.cli

import java.io.FileNotFoundException

import better.files.File
import com.opticdev.core.compiler.Compiler
import com.opticdev.core.sdk.SdkDescription
import com.opticdev.core.sourcegear.gears.parsing.ParseAsModel
import com.opticdev.core.sourceparsers.SourceParserManager
import com.opticdev.core.storage.DataDirectory
import com.opticdev.core.storage.schema.SchemaStorage
import play.api.libs.json.Json

import scala.util.Try

object Installer extends {
  SourceParserManager.installParser(System.getProperty("user.home")+"/Developer/knack/parsers/javascript-lang/out/artifacts/javascript_lang_jar/javascript-lang.jar")

  def installDescription(file: File) (implicit logToCli: Boolean = false) = Try {

    println("Starting...")
    val asDescription = Try {
      val contents = file.contentAsString
      SdkDescription.fromJson(Json.parse(contents))
    }

    if (asDescription.isSuccess) {
      val compiler = Compiler.setup(asDescription.get)
      val output = compiler.execute
      if (logToCli) {
        Thread.sleep(80)
        println("Installed")
        println("Lenses:")
        output.gears.foreach(i => println(i.identifier))
        println("Schemas:")
        output.schemas.foreach(i=> println(i.identifier))
      }

      //write to disk
      output.schemas.foreach(SchemaStorage.writeToStorage)

    } else {
      throw asDescription.failed.get
    }

  }
}
