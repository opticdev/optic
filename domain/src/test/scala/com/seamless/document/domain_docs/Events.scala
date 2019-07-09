package com.seamless.document.domain_docs
import com.seamless.document._
import com.seamless.document.DocBuilder

class Events extends DocBuilder("events.md") {

  h1("Events")

  rfcEvents.foreach { case event =>
    h3(event.name)
    p("about me")
  }

}



























object Events {
  def main(args: Array[String]): Unit = {
    println(new Events().toString)
  }
}