package nashorn.scriptobjects.accumulators.Context

import cognitro.parsers.GraphUtils.{BaseFileNode, FileNode}
import nashorn.scriptobjects.SharedStore

class BundleScope {
  val sharedFiles = new SharedStore

  private var fileNode : BaseFileNode = null
  def currentFile(fN: BaseFileNode) = {
    if (fileNode == null) {
      fileNode = fN
      true
    } else {
      fileNode == fN
    }
  }

}
