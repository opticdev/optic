package com.opticdev.server.http

import com.opticdev.server.http.state.StateManager

object Lifecycle {

  implicit val stateManager = StateManager.empty

  def startup = {
    Server.main()
  }

  def main(args: Array[String]) {
    startup
  }

}
