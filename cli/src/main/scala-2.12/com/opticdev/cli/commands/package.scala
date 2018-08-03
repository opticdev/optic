package com.opticdev.cli

import akka.actor.ActorSystem
import akka.stream.ActorMaterializer

package object commands {
  val baseUrl = "https://localhost:30333"
  implicit val actorSystem = ActorSystem("cli-system")
  implicit val materializer = ActorMaterializer()
}
