// extern crate protobuf_codegen_pure;

fn main() {
  protobuf_codegen_pure::Codegen::new()
    .out_dir("src/protos/generated")
    .inputs(&["src/protos/shapehash.proto"])
    .include("src/protos")
    .run()
    .expect("Generating Rust structs for protos has failed");
}
