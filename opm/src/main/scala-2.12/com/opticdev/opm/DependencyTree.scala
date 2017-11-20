package com.opticdev.opm

import com.opticdev.opm.context.TreeContext
import com.opticdev.sdk.descriptions.Schema

case class Leaf(opticPackage: OpticPackage, tree: Tree = Tree()) {
  def dependencies: Seq[OpticPackage] = tree.leafs.map(_.opticPackage)
}

case class Tree(leafs: Leaf*) {
  def flatten : Seq[OpticPackage] = leafs.flatMap(l=> l.tree.flatten :+ l.opticPackage)
  def flattenSchemas : Set[Schema] = flatten.flatMap(_.schemas.values).toSet
  def treeContext: TreeContext = TreeContext(this)
}
