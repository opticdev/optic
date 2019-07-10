package com.seamless.document.domain_docs

import com.seamless.document.{DocBuilder, _}

class Commands extends DocBuilder {

  def getCommandDesc(key: String) = {
    Map(

    ).get(key)
  }


  h3("Requests Domain")
  requestCommands.sortBy(_.name).foreach { case event =>
    h4(event.name)
//    p(getCommandDesc(event.name).get)
    argsFrom(event.args)
  }


  h3("Data Types Domain")
  dataTypesCommands.sortBy(_.name).foreach { case event =>
    h4(event.name)
//    p(getCommandDesc(event.name).get)
    argsFrom(event.args)
  }


//  h2("API Domain")
//  rfcCommands.sortBy(_.name).foreach { case event =>
//    h3(event.name)
////    p(getCommandDesc(event.name).get)
//    argsFrom(event.args)
//  }
}



object Commands {
  def main(args: Array[String]): Unit = {
    println(new Commands().toString)
  }
}