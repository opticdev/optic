package com.opticdev.launcher

import better.files.File
import better.files._
import System.{getProperty => Prop}
import java.io.{BufferedReader, InputStreamReader}

import com.opticdev.server.http.Lifecycle

object ServiceLauncher {

//  def classRoot = new java.io.File(this.getClass.getProtectionDomain().getCodeSource().getLocation().toURI().getPath()).toScala
//
//  classRoot / "com" / "opticdev" / "server" / "Lifecycle$.class"

  val classpath  = Prop("java.class.path")
  val sep        = Prop("file.separator")
  val path       = Prop("java.home")+sep+"bin"+sep+"java"


  def spawn(className:      String,
            redirectStream: Boolean) {

    val processBuilder = new ProcessBuilder(path, "-cp", classpath, className)
//    val pbcmd          = processBuilder.command().toString()
//
//    println(Array("java", "-cp", classpath, className).foreach(println))
//    val process = Runtime.getRuntime.exec(Array("java", "-cp", classpath, className, "&"))

    processBuilder.redirectErrorStream(redirectStream)

    val process = processBuilder.start()
    val reader  = new BufferedReader(new InputStreamReader(process.getInputStream()))

    println(reader.readLine())
    reader.close()
    process.waitFor()
  }


  def startOpticServer = {
    val opticServer = Lifecycle.getClass().getCanonicalName().dropRight(1)
    spawn(opticServer, true)
  }

}
