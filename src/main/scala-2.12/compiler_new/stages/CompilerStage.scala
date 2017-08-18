package compiler_new.stages

trait CompilerStage[O] {
  def run: O
}
