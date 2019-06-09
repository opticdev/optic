package com.seamless.oas

import com.seamless.oas.oas_to_commands.{CommandStream, JsonSchemaToCommandsImplicits}
import com.seamless.oas.versions.{OAS2Resolver, OAS3Resolver}
import play.api.libs.json.{JsObject, JsString, Json}

import scala.util.Try
import com.seamless.oas.oas_to_commands.RequestsToCommandsImplicits._
import com.seamless.oas.QueryImplicits._
import JsonSchemaToCommandsImplicits._
import com.seamless.contexts.rfc.Commands.RfcCommand
import com.seamless.contexts.rfc.Events.RfcEvent
import com.seamless.contexts.rfc.{RfcService, RfcState}

object Parser {

  def parseOAS(contents: String) = {
    val (root, jsonParseTime) = time(orNiceError( _ => Json.parse(contents).as[JsObject], "JSON could not be parsed"))

    val resolver = orNiceError( _ => {
      val checkSwagger2 = Try(root.as[JsObject].value("swagger").as[JsString].value.startsWith("2"))
      val checkOAS3 = Try(root.as[JsObject].value("openapi").as[JsString].value.startsWith("3"))
      if (checkSwagger2.isSuccess) {
        new OAS2Resolver(root)
      } else if (checkOAS3.isSuccess) {
        new OAS3Resolver(root)
      } else {
        throw new Error(s"OAS version is not supported. Spec should have key swagger: 2.x or openapi: 3.x ")
      }
    }, "OAS Version is not supported")


    val (allDefinitionsCommands, definitionsCommandStreamTime) = time {
      val definitionsCommandStream = CommandStream.merge(resolver.definitions.map(_.toCommandStream))
      definitionsCommandStream.flatten
    }

    val (allEndpointsCommands, endpointsCommandStreamTime) = time {
      val endpointsCommandStream = CommandStream.merge(resolver.paths.flatMap(_.operations).map(_.toCommandStream))
      endpointsCommandStream.flatten
    }


    val (service, buildSnapshotTime) = time {
      val service = new RfcService

      (allDefinitionsCommands).foreach(command => service.handleCommand("test", command))
//      (allDefinitionsCommands ++ allEndpointsCommands).foreach(command => service.handleCommand("test", command))
      service
    }

    val executionsTime = ExecutionsTime(jsonParseTime, definitionsCommandStreamTime, endpointsCommandStreamTime, buildSnapshotTime)

    ParseResult(resolver.oas_version, executionsTime, allDefinitionsCommands, service.currentState("test"))
  }

  case class ParseResult(oas_version: String, executionTime: ExecutionsTime, events: Vector[RfcCommand], snapshot: RfcState)
  case class ExecutionsTime(jsonParseTime: Long, definitionsCommandStream: Long, endpointsCommandStream: Long, buildSnapshot: Long) {
    def total: Long = jsonParseTime + definitionsCommandStream + endpointsCommandStream + buildSnapshot

    override def toString: String = {
      s"""
        |
        |Json Parse: ${jsonParseTime}ms
        |Definitions to commands: ${definitionsCommandStream}ms
        |Endpoints to commands: ${endpointsCommandStream}ms
        |Build Snapshot: ${buildSnapshot}ms
        |
        |Total: ${total}ms
      """.stripMargin
    }
  }

  //utils
  protected def orNiceError[A](func: Unit => A, error: String): A = {
    val attempt = Try(func())
    if (attempt.isSuccess) attempt.get else throw new Error(error + "\n" + attempt.failed.get.getMessage)
  }

  protected def time[R](block: => R): (R, Long) = {
    val t0 = System.currentTimeMillis()
    val result = block    // call-by-name
    val t1 = System.currentTimeMillis()
    (result, (t1 - t0))
  }

}
