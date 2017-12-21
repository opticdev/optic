package com.opticdev
import akka.actor.ActorSystem
import com.opticdev.common.PackageRef
import com.opticdev.sdk.descriptions.SchemaRef

package object core {
    implicit val actorSystem = ActorSystem("opticActors")

    val BlankSchema = SchemaRef(PackageRef("none:none"), "BLANK")

//    private class MarvinRef extends BaseAstNode {
//
//    }

}
