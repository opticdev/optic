package com.opticdev.opm

import java.io.FileNotFoundException

import better.files.File
import com.opticdev.common.storage.DataDirectory
import com.vdurmont.semver4j.Semver
import com.vdurmont.semver4j.Semver.SemverType
import play.api.libs.json.{JsObject, Json}

import scala.util.{Failure, Try}

object PackageStorage {

  def writeToStorage(opticPackage: OpticPackage): File = {
    val packages = DataDirectory.packages / ""  createIfNotExists(asDirectory = true)

    val author = packages / opticPackage.author createIfNotExists(asDirectory = true)
    val name = author / opticPackage.name createIfNotExists(asDirectory = true)
    val version = name / opticPackage.version

    version.overwrite(opticPackage.contents.toString())
  }

  def loadFromStorage(packageRef: PackageRef) : Try[OpticPackage] = {

    def notFound = Failure(new FileNotFoundException("Can not find local version of package "+packageRef.packageId))

    val packageDirectory = DataDirectory.packages / packageRef.author / packageRef.name

    if (packageDirectory.exists && packageDirectory.isDirectory) {

      val versionOption = findVersion(packageDirectory.list.toVector, packageRef.version)

      if (versionOption.isDefined) {
        val (version, file) = versionOption.get
        Try(OpticPackage(packageRef.packageId, Json.parse(file.contentAsString).as[JsObject]))
      } else {
        notFound
      }

    } else {
      notFound
    }

  }

  def installedPackages: Vector[String] = {
    val authors = DataDirectory.packages.list.filter(i=> !i.isHidden && i.isDirectory)

    authors.flatMap(i=> {
      val authorName = i.name
      val packages = i.list.filter(i=> !i.isHidden && i.isDirectory)

      packages.flatMap(p=> {

        val packageName = p.name

        p.list.filter(i=> !i.isHidden && i.isRegularFile && Try(new Semver(i.name, SemverType.NPM)).isSuccess)
          .map(ver=> authorName+":"+packageName+"@"+ver.name)

      })

    }).toVector.sorted
  }

  def clearLocalPackages = {
    DataDirectory.packages.list.foreach(_.delete(true))
  }

  def findVersion(files: Vector[File], version: String) : Option[(Semver, File)]= {
    val versionFileTuples = files.map(file=> {
      val semVer = Try(new Semver(file.name, SemverType.NPM))
      if (semVer.isSuccess) {
        (semVer.get, file)
      } else None
    }).filterNot(_ == None)
        .asInstanceOf[Vector[(Semver, File)]]

    val matchingVersionsSorted = versionFileTuples.filter(pair=> {
      pair._1.satisfies(version) || version == "latest"
    }).sortWith((a, b)=> {
      //get highest satisfying version
      a._1.isGreaterThan(b._1)
    })

    matchingVersionsSorted.headOption
  }

}
