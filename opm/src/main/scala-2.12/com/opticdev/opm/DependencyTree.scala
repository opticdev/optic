package com.opticdev.opm

import com.opticdev.opm.context.TreeContext

case class Leaf(opticPackage: OpticPackage, tree: Tree = Tree()) {
  def dependencies: Seq[OpticPackage] = tree.leafs.map(_.opticPackage)
}

case class Tree(leafs: Leaf*) {
  def flatten : Seq[OpticPackage] = leafs.flatMap(l=> l.tree.flatten :+ l.opticPackage)
  def treeContext: TreeContext = TreeContext(this)
}
