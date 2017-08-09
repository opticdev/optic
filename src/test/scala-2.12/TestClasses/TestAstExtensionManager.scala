package TestClasses

import cognitro.parsers.AstExtension.{AstExtensionBase, AstExtensionSet}
import cognitro.parsers.GraphUtils.NodeType
import providers.AstExtensionProvider

object TestAstExtensionManager extends AstExtensionProvider {

    private var astExtensions : Vector[AstExtensionBase] = Vector()

    override def clear = astExtensions = Vector()

    override def addAstExtension(extension: AstExtensionBase): Unit = {
      astExtensions :+= extension
    }

    override def addAstExtensions(extensions: AstExtensionBase*) : Unit = {
      astExtensions ++= extensions.toVector
    }

    override def removeAstExtension(extension: AstExtensionBase): Unit = {
      astExtensions = astExtensions.filterNot(_ == extension)
    }

  override def extensionSet: AstExtensionSet = AstExtensionSet(astExtensions.toSet)

  override def extensionForNodeType(nodeType: NodeType): Option[AstExtensionBase] = astExtensions.find(_.extendsNode == nodeType)

}
