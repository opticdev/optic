package com.useoptic.common.spec_types

import org.scalatest.FunSpec
import play.api.libs.json.Json

class AuthenticationSpec extends FunSpec {

  describe("deserializeS optic.yml specs") {
    it("can parse basic type") {
      assert(Authentication.fromJson(Json.parse("""{"type": "basic"}""")).get == HTTPBasic)
    }

    it("can parse bearer type") {
      assert(Authentication.fromJson(Json.parse("""{"type": "bearer"}""")).get == HTTPBearer)
    }

    it("can parse apiKey type") {
      assert(Authentication.fromJson(Json.parse("""{"type": "apiKey", "in": "cookie", "name": "token"}""")).get == APIKey("cookie", "token"))
    }

    it("will fail to parse invalid type") {
      assert(Authentication.fromJson(Json.parse("""{"type": "not-correct"}""")).failed.get.getMessage == "requirement failed: Auth definitions must be one of ['basic', 'bearer', 'apiKey']")
    }

    it("will fail to parse invalid in field") {
      assert(Authentication.fromJson(Json.parse("""{"type": "apiKey", "in": "wrong", "name": "token"}""")).failed.get.getMessage == "requirement failed: APIKey Auth 'in' field must be one of ['cookie', 'header', 'query']")
    }

  }

}
