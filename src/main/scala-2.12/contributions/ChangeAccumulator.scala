package cognitro.core.contributions

import better.files.File
import cognitro.parsers.GraphUtils.{FileNode, InMemoryFileNode}
import graph.FileNodeWrapper

class ChangeAccumulator {

  private var contributions : Set[Contribution] = Set()
  def addContribution(contribution: Contribution) = contributions += contribution
  def addContributions(cons: Contribution*) = contributions = contributions ++ cons

  //@todo conflict resolution. What happens if fields overlap. Shouldn't graphdepth also play a role or is that coorelated in a way that makes it safe
  def prepareChanges: Map[FileNodeWrapper, Vector[Contribution]] = contributions
    .groupBy(_.fileNode)
    .map(i=> (i._1, i._2.toVector.sortBy(_.range).reverse))

  def output = {

    val changes = prepareChanges

    changes.foreach(file=> {
      val fileNode = file._1
      val fileContributions = file._2

      var contents = fileNode.node.contents

      //apply changes in memory
      fileContributions.foreach(i=> {
        contents = i.applyTo(contents)
      })

      fileNode.node match {
        case file: FileNode => {
          val fn = File(file.filePath)
          fn.overwrite(contents)
        }
        case mem: InMemoryFileNode => {
          mem.raw = contents
        }
      }

    })

  }

  def hasChanges = contributions.nonEmpty

}
