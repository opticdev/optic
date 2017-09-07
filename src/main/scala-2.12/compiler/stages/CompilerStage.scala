package compiler.stages

trait CompilerStage[O] {
  def run: O
}
