package com.opticdev.opm.context

import com.opticdev.opm.DependencyTree

case class TreeContext(dependencyTree: DependencyTree) {

  private val leafLookup: Map[String, Leaf] = {

    //being a map will replace all duplicates. Since it's the full name this will have the intended effect
    def leafMap(tree: Tree) : Map[String, Leaf] = {
      tree.leafs.flatMap(i=> {
        val key = i.opticPackage.packageFull
        val dependencies = leafMap(i.tree)
        dependencies + (key-> i)
      }).toMap
    }

    leafMap(dependencyTree)
  }

  def get(fullId: String) : Option[PackageContext] = {
    leafLookup.get(fullId).collect {
      case l: Leaf => PackageContext(l)
    }
  }

  def apply(fullId: String): Option[PackageContext] = get(fullId)
}
