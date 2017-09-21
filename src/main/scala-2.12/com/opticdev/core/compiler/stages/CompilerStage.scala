package com.opticdev.core.compiler.stages

trait CompilerStage[O] {
  def run: O
}
