package com.opticdev
import akka.actor.ActorSystem
import com.opticdev.common.PackageRef
import com.opticdev.sdk.descriptions.SchemaRef

package object core {
    implicit val actorSystem = ActorSystem("opticActors")

    val BlankSchema = SchemaRef(Some(PackageRef("none:none", "0.1.0")), "BLANK")

//    private class MarvinRef extends BaseAstNode {
//
//    }

}
