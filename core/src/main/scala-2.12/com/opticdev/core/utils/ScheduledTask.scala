package com.opticdev.core.utils
import com.opticdev.core.sourcegear.actors.ActorCluster

import scala.concurrent.duration._

class ScheduledTask(interval: FiniteDuration, task: ()=> Unit, initial: FiniteDuration = 0 seconds)(implicit actorCluster: ActorCluster) {
  def start = {
    val scheduler = actorCluster.actorSystem.scheduler
    implicit val executor = actorCluster.actorSystem.dispatcher
    scheduler.schedule(
      initialDelay = initial,
      interval = interval,
      runnable = () => task())
  }
}
