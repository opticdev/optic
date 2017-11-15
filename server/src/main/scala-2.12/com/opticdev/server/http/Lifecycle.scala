package com.opticdev.server.http

import com.opticdev.server.http.state.StateManager

object Lifecycle extends App {

  implicit val stateManager = StateManager.empty
  startup
  def startup = {
    Server.start()
  }


}
