//package com.opticdev.core.cli
//
//import java.io.FileNotFoundException
//
//import better.files.File
//import com.opticdev.core.compiler.Compiler
//import com.opticdev.core.sdk.SdkDescription
//import com.opticdev.core.sourcegear.gears.parsing.ParseAsModel
//import com.opticdev.common.storage.DataDirectory
//import com.opticdev.core.storage.stores.{ParserStorage}
//import com.opticdev.parsers.{ParserBase, SourceParserManager}
//import play.api.libs.json.Json
//
//import scala.util.{Failure, Success, Try}
//
//object Installer extends {
//
//  SourceParserManager.installParser(System.getProperty("user.home")+"/Developer/knack/parsers/javascript-lang/out/artifacts/javascript_lang_jar/javascript-lang.jar")
//
//  def installDescription(file: File) (implicit logToCli: Boolean = false) = Try {
//
//    println("Starting...")
//    val asDescription = Try {
//      val contents = file.contentAsString
//      SdkDescription.fromJson(Json.parse(contents))
//    }
//
//    if (asDescription.isSuccess) {
//      val compiler = Compiler.setup(asDescription.get)
//      val output = compiler.execute
//      if (logToCli) {
//        Thread.sleep(80)
//        println("Installed")
//        println("Lenses:")
//        output.gears.foreach(i => println(i.identifier))
//        println("Schemas:")
//        output.schemas.foreach(i=> println(i.identifier))
//      }
//
//      //write to disk
////      output.schemas.foreach(SchemaStorage.writeToStorage)
//
//    } else {
//      throw asDescription.failed.get
//    }
//
//  }
//
//  def installParser(value: File)(implicit logToCli: Boolean = false): Try[ParserBase] = Try {
//    val verifyTry = SourceParserManager.verifyParser(value.pathAsString)
//
//    val writeToStorageTry = Try(ParserStorage.writeToStorage(value))
//
//    if (logToCli) {
//      if (verifyTry.isSuccess && writeToStorageTry.isSuccess) println("Installed parser "+ verifyTry.get.languageName)
//      else println("Unable to install parser from jar "+value.name)
//    }
//
//    if (verifyTry.isSuccess && writeToStorageTry.isSuccess) {
//      verifyTry.get
//    } else {
//      throw new Error("Unable to install parser from jar "+value.name)
//    }
//
//  }
//
//}
