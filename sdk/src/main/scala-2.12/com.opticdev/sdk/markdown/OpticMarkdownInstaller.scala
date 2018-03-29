package com.opticdev.sdk.markdown

import better.files.File
import com.opticdev.common.storage.DataDirectory
import com.opticdev.sdk.BuildInfo
import com.opticdev.common.PlatformConstants
import play.api.libs.json.{JsObject, Json}

import scala.util.{Failure, Success, Try}
import sys.process._

object OpticMarkdownInstaller {
  def getOrInstall : Try[CallOpticMarkdown.type] = {
    synchronized {
      if (CallOpticMarkdown.isInstalled) {
        println("ALREADY INSTALLED")
        Success(CallOpticMarkdown)
      } else {
        println("\nSTARTING OPTIC-MARKDOWN-INSTALL")
        //clear folder of older version if exists
        DataDirectory.bin.list.foreach(_.delete(true))
        download(BuildInfo.opticMDTar, BuildInfo.opticMDTarSum)
          .flatMap(unzip)
          .flatMap(npmInstall) match {
            case Success(a) => {
              println("\nOPTIC-MARKDOWN INSTALLED")
              Success(CallOpticMarkdown)
            }
            case Failure(f) => {
              println("\nOPTIC-MARKDOWN DID NOT INSTALL"+ f)
              cleanupOnFail
              Failure(f)
            }
          }
      }
    }
  }

  protected case object CallOpticMarkdown {

    val script = DataDirectory.bin / "optic-markdown" / "lib" / "cli.js"

    def isInstalled : Boolean = Try {
      val cmd = Seq(PlatformConstants.nodePath, script.pathAsString, "--version")
      cmd.!!(ProcessLogger(stdout append _, stderr append _))
    } match {
      case Success(a) => a.trim == BuildInfo.opticMDVersion
      case Failure(a) => false
    }

    def parseFile(filePath: String) : JsObject = {
      val cmd = Seq(PlatformConstants.nodePath, script.pathAsString, filePath)
      val result = cmd.!!(ProcessLogger(stdout append _, stderr append _))
      Json.parse(result).as[JsObject]
    }

    def parseString(contents: String) : JsObject = {
      val cmd = Seq(PlatformConstants.nodePath, "--raw", contents)
      val result = cmd.!!(ProcessLogger(stdout append _, stderr append _))
      Json.parse(result).as[JsObject]
    }
  }

  private def download(opticMDTar: String, opticMDTarSum: String) : Try[File] = Try {
    import java.net.URL

    val target = DataDirectory.bin / "optic-markdown.tgz"

    target.delete(true)

    //will throw if doesn't work
    new URL(opticMDTar) #> target.toJava !!(ProcessLogger(stdout append _, stderr append _))

    assert(target.sha1.toLowerCase == opticMDTarSum.toLowerCase, "optic-markdown sha does not match. Download failed")

    target
  }

  private def unzip(file: File) : Try[File] = Try {
    val mdDirectory: File = DataDirectory.bin / "optic-markdown"
    val unzip: Seq[String] = Seq(
      "tar",
      "-xzf",
      file.pathAsString,
      "-C",
      DataDirectory.bin.pathAsString,
    )

    unzip.!!(ProcessLogger(stdout append _, stderr append _))

    val mv: Seq[String] = Seq(
      "mv",
      (DataDirectory.bin / "package").pathAsString,
      mdDirectory.pathAsString
    )
    mv.!!(ProcessLogger(stdout append _, stderr append _))

    file.delete(true)
    assert(mdDirectory.isDirectory, "Optic Markdown could not be unzipped.")
    mdDirectory
  }

  private def npmInstall(directory: File) : Try[Unit] = Try {
    val process = sys.process.Process(Seq(PlatformConstants.nodePath, PlatformConstants.npmPath, "install"), directory.toJava)
    process.!(ProcessLogger(stdout append _, stderr append _))
  }

  private def cleanupOnFail = DataDirectory.bin.list.foreach(_.delete(true))
}
