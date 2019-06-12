package com.seamless.serialization

object SerializeCommands {
  import upickle.default._


  def main(args: Array[String]): Unit = {
    println(write(Seq(1, 2, 3)))
  }
}
