package com.opticdev.cli.binder

import com.opticdev.common.PlatformConstants
import com.opticdev.common.storage.{Linux, Mac, OS, Windows}
import java.nio.file.attribute.PosixFilePermission

import better.files.File
import java.io.{File => JFile}

import sys.process._

object BindCLI {

  private val _jvmLocation = File(System.getProperties.getProperty("java.home"))

  def toNativeBash(running: String) = {

    PlatformConstants.platform match {
      case Mac => {
        bindCmdMac(running)
        null
      }
      case _ => println("Could not bind cli to native bash")
    }
  }

  def bindCmdMac(runningJar: String) = {
    if (runningJar.contains(".jar")) {

      val cmd = Seq((
        _jvmLocation / "bin" / "java").toString().replaceAll(" ", "\\\\ "),
        "-cp",
        runningJar.replaceAll(" ", "\\\\ "),
        "com.opticdev.cli.Cli",
        "\"$@\""
      ).mkString(" ")

      File("/usr/local/bin/optic").write(cmd).addPermission(PosixFilePermission.OWNER_EXECUTE)

    } else {

      val testCliJar = File("test-examples/resources/cli/test-cli.jar")

      val cmd = Seq((
        _jvmLocation / "bin" / "java").toString().replaceAll(" ", "\\\\ "),
        "-jar",
        testCliJar.pathAsString.replaceAll(" ", "\\\\ ")
      ).mkString(" ")

      File("/usr/local/bin/optic").write(cmd).addPermission(PosixFilePermission.OWNER_EXECUTE)
    }
  }

}
