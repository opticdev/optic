package com.opticdev.server.http.routes.installer

import java.net.URL
import better.files._
import File._
import sys.process._
import com.opticdev.installer.Config

object TutorialDirectoryBuilder {
  def build: Unit = {

    val ogt = File("/tmp/optic-guided-tutorial").delete(true).createIfNotExists(asDirectory = true)

    (ogt / "optic.yml").createIfNotExists().write(
      """
        |name: Optic Guided Tutorial
        |parsers:
        |  - es7
        |
        |
        |skills:
        |  - optic:express-js@0.3.0
        |  - optic:rest@0.3.0
        |  - optic:requestjs@0.3.0
        |
      """.stripMargin)

    (ogt / "opticapi.js").createIfNotExists().write(
      """
        |app.post('https://registry.opticdev.com/users/create', (req, res) => { //name: Optic User Sign up Route
        |  req.body.namespace
        |  req.body.email
        |  req.body.password
        |})
        |
        |app.post('https://registry.opticdev.com/packages/create', (req, res) => { //name: Publish Optic Skill Route
        |  req.body.namespace
        |  req.body.packageName
        |  req.body.version
        |  req.body.mdVersion
        |  req.body.contents
        |  req.body.apiToken
        |})
        |
        |app.get('https://registry.opticdev.com/packages', (req, res) => { //name: Resolve List of Optic Skills
        |  req.query.packages
        |})
        |
      """.stripMargin)

    (ogt / "stub.js").createIfNotExists().write("")

    //add demo project
    val downloadDestination = File("/tmp/optic-demo-project.zip")
    val targetDirectory = home / "Downloads"
    (new URL("https://github.com/opticdev/optic-demo-project/archive/master.zip") #> downloadDestination.toJava).!!
    downloadDestination.unzipTo(targetDirectory)

  }
}
