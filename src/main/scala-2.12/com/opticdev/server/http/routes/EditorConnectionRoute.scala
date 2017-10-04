package com.opticdev.server.http.routes

import com.opticdev.server.http.state.StateManager
import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.model.ws.{Message, TextMessage}
import akka.http.scaladsl.server.Directives._
import akka.stream.ActorMaterializer
import akka.stream.scaladsl.Flow
import com.opticdev.server.http.routes.socket.EditorConnection
import com.opticdev.server.http.routes.socket.Protocol.OpticEvent
import com.opticdev._
import scala.concurrent.ExecutionContext
import scala.util.Failure

class EditorConnectionRoute(implicit executionContext: ExecutionContext, stateManager: StateManager) {
  val route = get {
    pathPrefix("socket" / Remaining ) { editor =>
      handleWebSocketMessages(websocketChatFlow(EditorConnection.findOrCreate(editor)))
    }
  }


  def websocketChatFlow(editorConnection: EditorConnection): Flow[Message, Message, Any] =
    Flow[Message]
      .collect {
        case TextMessage.Strict(msg) => {
          println("RECEIVED "+ msg)
          msg
        }
      }
      .via(editorConnection.websocketFlow)
      .map {
        case msg: OpticEvent => {
          println("SENT "+ msg)
          TextMessage.Strict(msg.asString)
        }
      }.via(reportErrorsFlow)

  def reportErrorsFlow[T]: Flow[T, T, Any] =
    Flow[T]
      .watchTermination()((_, f) => f.onComplete {
        case Failure(cause) =>
          println(s"WS stream failed with $cause")
        case _ => //
      })

}
