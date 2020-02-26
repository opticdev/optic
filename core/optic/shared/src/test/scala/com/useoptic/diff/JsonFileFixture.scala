package com.useoptic.diff

import io.circe.Json
import io.circe.jawn.parseFile
import java.io.File

import com.useoptic.contexts.rfc.{Commands, Events}
import com.useoptic.serialization.{CommandSerialization, EventSerialization}

import scala.util.Try

trait JsonFileFixture {
  def fromFile(slug: String): Json = {
    val filePath = "src/test/resources/diff-scenarios/" + slug + ".json"
    val attempt = parseFile(new File(filePath))
    if (attempt.isLeft) {
      throw new Error(attempt.left.get)
    }
    attempt.right.get
  }
  def commandsFrom(slug: String): Vector[Commands.RfcCommand] = {
    val filePath = "src/test/resources/diff-scenarios/" + slug + ".commands.json"
    val json = parseFile(new File(filePath)).right.get
    CommandSerialization.fromJson(json).get
  }
  def eventsFrom(slug: String): Vector[Events.RfcEvent] = {
    val filePath = "src/test/resources/diff-scenarios/" + slug + ".events.json"
    val json = parseFile(new File(filePath)).right.get
    EventSerialization.fromJson(json).get
  }
}
