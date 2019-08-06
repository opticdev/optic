package com.seamless.oas.oas_to_commands

import com.seamless.contexts.rfc.Commands.RfcCommand

class MutableCommandStream {
  private val init = collection.mutable.ListBuffer[RfcCommand]()
  private val describe = collection.mutable.ListBuffer[RfcCommand]()

  def appendInit(rfcCommand: RfcCommand*) = {
    /*println("yyy")
    rfcCommand.foreach(println)*/
    init.appendAll(rfcCommand)
  }
  def appendInit(rfcCommand: Vector[RfcCommand]) = init.appendAll(rfcCommand)
  
  def appendDescribe(rfcCommand: RfcCommand*) = {
   /* println("yyy")
    rfcCommand.foreach(println)*/
    describe.appendAll(rfcCommand)
  }
  def appendDescribe(rfcCommand: Vector[RfcCommand]) = describe.appendAll(rfcCommand)

  def toImmutable = ImmutableCommandStream(init.toVector, describe.toVector)
}

case class ImmutableCommandStream(init: Vector[RfcCommand], describe: Vector[RfcCommand]) {
  def flatten: Vector[RfcCommand] = init ++ describe
}

object CommandStream {
  def empty = ImmutableCommandStream(Vector(), Vector())
  def emptyMutable = new MutableCommandStream

  def merge(all: Vector[ImmutableCommandStream]) = {
    val combined = CommandStream.emptyMutable

    all.foreach { i =>
      combined.appendInit(i.init:_*)
      combined.appendDescribe(i.describe:_*)
    }

    combined.toImmutable
  }
}