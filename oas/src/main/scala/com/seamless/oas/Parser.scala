package com.seamless.oas

import com.seamless.oas.oas_to_commands.{CommandStream, JsonSchemaToCommandsImplicits}
import com.seamless.oas.versions.{OAS2Resolver, OAS3Resolver}
import play.api.libs.json.{JsObject, JsString}

import scala.util.Try
import com.seamless.oas.oas_to_commands.RequestsToCommandsImplicits._
import JsonSchemaToCommandsImplicits._
import com.seamless.contexts.rfc.Commands.{RfcCommand, SetAPIName}
import com.seamless.contexts.rfc.Events.RfcEvent
import com.seamless.contexts.rfc.{RfcService, RfcState}
import com.seamless.ddd.InMemoryEventStore

object Parser {

  def parseOAS(contents: String): ParseResult = {
    val (root, jsonParseTime) = time(orNiceError( _ => YamlJsonNormalize.jsonFrom(contents).as[JsObject], "JSON or YAML could not be parsed"))

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


    val nameCommand = resolver.title.map( title => SetAPIName(title))

    val (allDefinitionsCommands, definitionsCommandStreamTime) = time {
      val definitionsCommandStream = CommandStream.merge(resolver.definitions.map(_.toCommandStream))
      definitionsCommandStream.flatten
    }

    val (allEndpointsCommands, endpointsCommandStreamTime) = time {
      implicit val pathContext = resolver.paths.toCommandStream
      val endpointsCommandStream = CommandStream.merge(resolver.paths.flatMap(_.operations).map(_.toCommandStream))
      CommandStream.merge(Vector(pathContext.commands, endpointsCommandStream)).flatten
    }

    val allCommands = {
      (if (nameCommand.isDefined) Vector(nameCommand.get) else Vector.empty) ++
      allDefinitionsCommands ++ allEndpointsCommands
    }

    val (service, buildSnapshotTime) = time {
      val service = new RfcService(new InMemoryEventStore[RfcEvent])

      allCommands.foreach(command => {
        println(command)
        service.handleCommand("test", command)
      })
      service
    }

    val executionsTime = ExecutionsTime(jsonParseTime, definitionsCommandStreamTime, endpointsCommandStreamTime, buildSnapshotTime)

    ParseResult(resolver.oas_version, executionsTime, allCommands, service.currentState("test"), resolver)
  }

  case class ParseResult(oas_version: String, executionTime: ExecutionsTime, commands: Vector[RfcCommand], snapshot: RfcState, resolver: OASResolver)
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
