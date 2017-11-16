//package com.opticdev.core.cli.output
//
//import me.tongfei.progressbar.ProgressBar
//
//class CliSessionMonitor(process: String, numberOfSteps: Int) {
//  case class StateChange(step: Int, name: String, last: Boolean = false) {
//    pb.stepTo(step)
//    pb.setExtraMessage(name)
//    if (last) {
//      pb.stop()
//    }
//  }
//
//  val pb = new ProgressBar(process, numberOfSteps)
//  def start = {
//    pb.start()
//    pb.stepTo(0)
//  }
//}
//
