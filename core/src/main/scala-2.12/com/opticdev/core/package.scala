package com.opticdev

import akka.actor.ActorSystem

package object core {
    implicit val actorSystem = ActorSystem("opticActors")
}
