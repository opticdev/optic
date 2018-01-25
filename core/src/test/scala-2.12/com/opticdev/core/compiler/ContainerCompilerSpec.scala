package com.opticdev.core.compiler

import com.opticdev.core.Fixture.TestBase
import com.opticdev.sdk.descriptions.{Container, Snippet}
import com.opticdev.sdk.descriptions.enums.RuleEnums.SamePlus

class ContainerCompilerSpec extends TestBase {

  val testContainer = Container(
    "express-subroute",
    Snippet("Javascript", None,
      """
        |import express from 'express'
        |
        |const app = express()
        |
        |
      """.stripMargin),
    Vector(),
    SamePlus,
    Vector()
  )

//  Description()
//  val compiler = Compiler.setup(description)
//  val finalOutput = compiler.execute
//
//  testContainer

}
