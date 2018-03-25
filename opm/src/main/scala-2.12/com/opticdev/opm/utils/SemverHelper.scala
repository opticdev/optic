package com.opticdev.opm.utils

import better.files.File
import com.opticdev.common.Versioned
import com.vdurmont.semver4j.Semver
import com.vdurmont.semver4j.Semver.SemverType

import scala.util.Try

object SemverHelper {

  case class VersionWrapper(version: String) extends Versioned

  def findVersion[A](availableVersions: Set[A], getVersion: (A) => Versioned, targetVersion: String) : Option[(Semver, A)]= {
    val tuples = availableVersions.toVector.map(i=> {
      val versioned = getVersion(i).version
      val semVer = Try(new Semver(versioned, SemverType.NPM))
      if (semVer.isSuccess) {
        (semVer.get, i)
      } else None
    }).filterNot(_ == None)
      .asInstanceOf[Vector[(Semver, A)]]

    val matchingVersionsSorted = tuples.filter(pair=> {
      pair._1.satisfies(targetVersion) || targetVersion == "latest"
    }).sortWith((a, b)=> {
      //get highest satisfying version
      a._1.isGreaterThan(b._1)
    })

    matchingVersionsSorted.headOption
  }

}
