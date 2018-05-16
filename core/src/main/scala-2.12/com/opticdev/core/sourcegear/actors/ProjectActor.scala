package com.opticdev.core.sourcegear.actors

import akka.actor.{Actor, ActorRef, Props}
import akka.actor.Actor.Receive
import com.opticdev.core.sourcegear.graph.{AstProjection, ProjectGraph, ProjectGraphWrapper}
import com.opticdev.parsers.AstGraph

import scala.concurrent.Await
import akka.pattern.ask
import akka.util.Timeout
import com.opticdev.core.sourcegear.ParseCache
import com.opticdev.core.sourcegear.project.status.SyncStatus
import com.opticdev.core.sourcegear.snapshot.Snapshot
import com.opticdev.core.sourcegear.sync.DiffSyncGraph

import scala.concurrent.Future
import concurrent.duration._

class ProjectActor(initialGraph: ProjectGraphWrapper)(implicit logToCli: Boolean, actorCluster: ActorCluster) extends Actor {

  override def receive: Receive = active(initialGraph)

  def active(graph: ProjectGraphWrapper): Receive = {
    //handle consequences of parsings
    case parsed: ParseSuccessful => {
      if (!parsed.fromCache) {
        graph.updateFile(parsed.parseResults.astGraph, parsed.file)
      }
      context.become(active(graph))
      sender() ! graph
    }

    case i: ParseFailed => {
      graph.removeFile(i.file, ignoreExceptions = true)
      context.become(active(graph))
      println("Failed to parse file "+ i.file)
      sender() ! graph
    }
    case deleted: FileDeleted => {
      graph.removeFile(deleted.file)
      context.become(active(graph))
      sender() ! graph
    }

    case CurrentGraph => sender ! graph
    case SetCurrentGraph(newGraph: ProjectGraph) => {
      context.become(active(new ProjectGraphWrapper(newGraph)(initialGraph.project)))
      sender ! Unit
    }
    case ClearGraph => {
      val emptyGraph = ProjectGraphWrapper.empty()(initialGraph.project)
      sender ! emptyGraph
      context.become(active(emptyGraph))
    }
    case NodeForId(id) => sender ! graph.nodeForId(id)
    case GetSnapshot(sg, project) => sender ! Snapshot.forSourceGearAndProjectGraph(sg, graph.projectGraph, project.actorCluster.parserSupervisorRef, project)

    //Forward parsing requests to the cluster supervisor
    case created: FileCreated => actorCluster.parserSupervisorRef ! ParseFile(created.file, sender(), created.project)(created.sourceGear)
    case updated: FileUpdated => actorCluster.parserSupervisorRef ! ParseFile(updated.file, sender(), updated.project)(updated.sourceGear)
    case updated: FileUpdatedInMemory => actorCluster.parserSupervisorRef ! ParseFileWithContents(updated.file, updated.contents, sender(), updated.project)(updated.sourceGear)
  }

}

object ProjectActor {
  def props(initialGraph: ProjectGraphWrapper)(implicit logToCli: Boolean, actorCluster: ActorCluster): Props = Props(new ProjectActor(initialGraph))
}

object ProjectActorSyncAccess {
  implicit val timeout: Timeout = Timeout(2 seconds)

  def clearGraph(projectActor: ActorRef): Future[ProjectGraphWrapper] = {
    (projectActor ? ClearGraph).asInstanceOf[Future[ProjectGraphWrapper]]
  }
}


object ProjectActorImplicits {
  implicit val timeout = Timeout(2 seconds)
  implicit class ProjectActorRef(projectActor: ActorRef) {
    def askForNode(id: String) = {
      val future = projectActor ? NodeForId(id)
      Await.result(future, timeout.duration).asInstanceOf[Option[AstProjection]]
    }
  }
}