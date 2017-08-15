package Cli

import java.io.ByteArrayOutputStream

import cli.{CliMain, Compile}
import cli.CliMain.Config
import org.scalatest.FunSpec

/**
  * Created by aidancunniffe on 8/9/17.
  */
class CliTest extends FunSpec {

  case class Output(standard: String, error: String)
  def testCommand(array: Array[String], success: (CliMain.Config)=> Unit = (config)=>{}, error: ()=> Unit = ()=>{}) = {
    val outCapture = new ByteArrayOutputStream
    val errCapture = new ByteArrayOutputStream

    Console.withOut(outCapture) {
      Console.withErr(errCapture) {
        CliStub.run(array, success, error)
      }
    }

    Output(outCapture.toString, errCapture.toString)
  }

  object CliStub {

    def run(args: Array[String], success: (CliMain.Config)=> Unit, error: ()=> Unit): Unit = {
      CliMain.parser.parse(args, Config())  match {
        case Some(config) =>
          success(config)
        case None =>
          error()
      }
    }

  }

  describe("Cli") {

    it("prints error when invalid cmd") {
      assert(testCommand(Array("bad")).error
        == "Error: Unknown argument 'bad'\nTry --help for more information.\n")
    }

    describe("compile command") {
      it("works for cd") {
        val output = testCommand(Array("compile", "--out=hello.optic"), (config)=> {
          assert(config.mode == "compile")
          assert(config.out.getPath == "hello.optic")
          assert(config.in.getPath == ".")
        })

      }

      it("works when directory is specified") {
        val output = testCommand(Array("compile", "mydir", "--out=hello.optic"), (config)=> {
          assert(config.mode == "compile")
          assert(config.out.getPath == "hello.optic")
          assert(config.in.getPath == "mydir")
        })
      }

      it("is parsed into case class") {
        val output = testCommand(Array("compile", "mydir", "--out=hello.optic"), (config)=> {
          assert(CliMain.configToCommand(config).isInstanceOf[Compile])
          assert(CliMain.configToCommand(config).asInstanceOf[Compile].in.getPath == "hello.optic")
          assert(CliMain.configToCommand(config).asInstanceOf[Compile].out.getPath == "mydir")
        })
      }

    }

  }

}
