package com.opticdev.opm

case class Leaf(opticPackage: OpticPackage, tree: Tree = Tree()) {
  def dependencies = tree.leafs.map(_.opticPackage)
}

case class Tree(leafs: Leaf*) {
  def flatten : Seq[OpticPackage] = leafs.flatMap(l=> l.tree.flatten :+ l.opticPackage)
}
