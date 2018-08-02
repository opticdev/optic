package com.opticdev.cli.binder

import com.opticdev.common.PlatformConstants
import com.opticdev.common.storage.{Linux, Mac, OS, Windows}
import java.nio.file.attribute.PosixFilePermission

import better.files.File
import java.io.{File => JFile}

import sys.process._

object BindCLI {

  private val jvmLocation = File(System.getProperties.getProperty("java.home"))
  private val runningJar = new JFile(this.getClass.getProtectionDomain.getCodeSource.getLocation.toURI).getPath


  def toNativeBash = {

    PlatformConstants.platform match {
      case Mac => {
        bindCmdMac
        null
      }
      case _ => println("Could not bind cli to native bash")
    }
  }

  def bindCmdMac = {
    if (runningJar.contains(".jar")) {

    } else {
      val cmd = Seq((
        jvmLocation / "bin" / "java").toString().replaceAll(" ", "\\\\ "),
        "-classpath",
        runningJar.replaceAll(" ", "\\\\ "),
        "com.opticdev.cli.binder.BindCLI$").mkString(" ")
      File("/usr/local/bin/optic").write(cmd).addPermission(PosixFilePermission.OWNER_EXECUTE)
    }
  }

}
