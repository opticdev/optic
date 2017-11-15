package com.opticdev.server.http.routes.socket

import akka.NotUsed
import akka.stream.scaladsl.Flow

trait Connection {
  def websocketFlow : Flow[String, OpticEvent, NotUsed]
}
