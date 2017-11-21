package com.opticdev.opm.context

import com.opticdev.opm.OpticPackage
import com.opticdev.sdk.descriptions.Schema

import scala.util.hashing.MurmurHash3

case class Leaf(opticPackage: OpticPackage, tree: Tree = Tree()) {
  def directDependencies: Set[OpticPackage] = tree.leafs.map(_.opticPackage).toSet
  def allDependencies : Set[OpticPackage] = tree.flatten
  def hash = tree.hash ^ MurmurHash3.stringHash(opticPackage.contents.toString())
}

case class Tree(leafs: Leaf*) {
  def flatten : Set[OpticPackage] = leafs.flatMap(l=> l.tree.flatten + l.opticPackage).toSet
  def flattenSchemas : Set[Schema] = flatten.flatMap(_.schemas.values).toSet
  def treeContext: TreeContext = TreeContext(this)

  final def hash: Int = leafs.map(_.hash).fold(0) { (int, lHash) => int ^ lHash }
}
