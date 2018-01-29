package com.opticdev.opm.helpers

import com.opticdev.common.PackageRef
import com.opticdev.sdk.descriptions._
import org.scalatest.FunSpec
import com.opticdev.opm.helpers.MDPackageResolveHelper._
import com.opticdev.sdk.descriptions.enums.RuleEnums.SameAnyOrderPlus

class MDPackageResolveHelperSpec extends FunSpec {

  describe("can replace an internal schemaref with a global schemaref") {

    it("when it's an internal reference") {
      val ref = SchemaRef(null, "internalOne")
      val parentPackageId = PackageRef("optic:test", "0.1.1")

      assert(resolveSchemaToGlobalSchema(ref, parentPackageId, Map()) ==
      SchemaRef(parentPackageId, ref.id))
    }

    it("when it's an external reference") {
      val ref = SchemaRef(PackageRef("optic:a"), "internalOne")
      val parentPackageId = PackageRef("optic:test", "0.1.1")

      val found = PackageRef("optic:a", "0.1.1")

      assert(resolveSchemaToGlobalSchema(ref, parentPackageId, Map(
        PackageRef("optic:a") -> found
      )) ==
        SchemaRef(found, ref.id))
    }

    it("will throw if it's an external reference that isn't found") {
      val ref = SchemaRef(PackageRef("optic:a"), "internalOne")
      val parentPackageId = PackageRef("optic:test", "0.1.1")
      assertThrows[Error] {
        resolveSchemaToGlobalSchema(ref, parentPackageId, Map())
      }
    }

  }

  it("can resolve all schemarefs in a component") {
    val parentPackageId = PackageRef("optic:test", "0.1.1")
    val found = PackageRef("optic:a", "0.1.1")

    val components : Vector[Component] = Vector(SchemaComponent(Seq("a"), SchemaRef(PackageRef("optic:a"), "one"), true, None))
    val output = resolveComponents(components, parentPackageId, Map(
      PackageRef("optic:a") -> found
    )).head

    assert(output.asInstanceOf[SchemaComponent].schema == SchemaRef(found, "one"))

  }

  it("can resolve all schemarefs in a lens") {
    val parentPackageId = PackageRef("optic:test", "0.1.1")
    val found = PackageRef("optic:a", "0.1.1")

    val components : Vector[Component] = Vector(
      SchemaComponent(Seq("a"), SchemaRef(PackageRef("optic:a"), "one"), true, None),
      SchemaComponent(Seq("b"), SchemaRef(null, "internalOne"), true, None)
    )

    val subcontainers = Vector(
      SubContainer("A", Vector(), SameAnyOrderPlus, Vector(
        SchemaComponent(Seq("a"), SchemaRef(PackageRef("optic:a"), "two"), true, None),
      ))
    )

    val resolved = resolveLens(Lens("test", SchemaRef(null, "test"), null, components, Vector(), subcontainers ,null), parentPackageId, Map(
      PackageRef("optic:a") -> found
    ))

    assert(resolved.schema == SchemaRef(parentPackageId, "test"))
    assert(resolved.components.map(_.asInstanceOf[SchemaComponent].schema) ==
      Vector(SchemaRef(found, "one"), SchemaRef(parentPackageId, "internalOne"))
    )
    assert(resolved.subcontainers.flatMap(_.schemaComponents.map(_.schema)) ==
      Vector(SchemaRef(found, "two")))

  }


}
