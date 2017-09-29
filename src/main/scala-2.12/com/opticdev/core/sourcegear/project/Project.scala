package com.opticdev.core.sourcegear.project

import better.files.File

class Project(name: String, baseDirectory: File) {

  def watch = {

  }

  def stopWatching = {

  }



  private var watchedFilesStore : Vector[File] = updateWatchedFiles
  def watchedFiles = watchedFilesStore
  def updateWatchedFiles: Vector[File] = {
    val filesToWatch = baseDirectory.listRecursively.toVector.filter(_.isRegularFile)
    watchedFilesStore = filesToWatch
    watchedFilesStore
  }

}