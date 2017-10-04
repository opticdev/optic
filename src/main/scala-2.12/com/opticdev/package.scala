package com

import akka.actor.ActorSystem
import akka.http.scaladsl.marshalling.ToResponseMarshallable
import akka.http.scaladsl.server.StandardRoute

package object opticdev {
  implicit val actorSystem = ActorSystem("opticActors")
}
