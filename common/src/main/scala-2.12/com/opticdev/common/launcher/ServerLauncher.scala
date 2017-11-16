package com.opticdev.common.launcher

import System.{getProperty => Prop}
import java.io.{BufferedReader, FileNotFoundException, InputStreamReader}

import com.opticdev.common.storage.DataDirectory

import scala.concurrent._
import scala.concurrent.duration._
import ExecutionContext.Implicits.global
import scala.concurrent.ExecutionContext
import scala.util.{Success, Try}
import scala.concurrent.{ Future, Promise }


object ServerLauncher {

  val opticDistro = DataDirectory.root / "optic.jar"

  def launchServer = Try {

    if (!opticDistro.exists) throw new FileNotFoundException()

    val classpath  = opticDistro.pathAsString
    val sep        = Prop("file.separator")
    val path       = Prop("java.home")+sep+"bin"+sep+"java"
    val className = "com.opticdev.server.http.Lifecycle"

    val p = Promise[Process]()
    val f = p.future


    val future =Future {
      val processBuilder = new ProcessBuilder(path, "-cp", classpath, className)

      processBuilder.redirectErrorStream(true)

      val process = processBuilder.start()
      val reader  = new BufferedReader(new InputStreamReader(process.getInputStream()))
      p success process
      println(reader.readLine())
      reader.close()
      process.waitFor()
    }.onComplete(i=> {
      if (i.isFailure) throw i.failed.get
    })

    Success(Await.result(f, 10 seconds))
  }

}
