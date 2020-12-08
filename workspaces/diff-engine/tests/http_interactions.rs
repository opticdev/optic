use optic_diff_engine::streams;
use optic_diff_engine::HttpInteraction;
use tokio::stream::StreamExt;

// fn can_async_read_stream_of_newline_delimited_json() {
//   let current_dir = std::env::current_dir().unwrap();
//   let fixture_path = current_dir
//     .join("tests/fixtures/todos-interaction.json_stream")
//     .to_str()
//     .unwrap();
//   // let fd = std::fs::File::open(fixture_path);
// }

#[test]
#[should_panic] // avro deserializing doesn't work yet
fn can_read_avro_serialized_interactions() {
  let fd = std::fs::File::open(
    std::env::current_dir()
      .unwrap()
      .join("tests/fixtures/ergast-captures/0.optic-capture.avro")
      .to_str()
      .unwrap(),
  )
  .expect("test capture file should be readable");

  let interactions: Vec<_> = HttpInteraction::from_avro()
    .reader(fd)
    .expect("interactions from capture should deserialize")
    .collect();

  assert!(interactions.len() > 0);
}

#[tokio::test]
async fn can_async_read_stream_of_newline_delimited_json() {
  let fd = tokio::fs::File::open(
    std::env::current_dir()
      .unwrap()
      .join("tests/fixtures/todos-interaction.json_stream")
      .to_str()
      .unwrap(),
  )
  .await
  .expect("test fixture should exist");

  let mut lines = streams::http_interaction::json_lines(fd);

  let first_event = lines
    .next()
    .await
    .expect("there should still be events left")
    .expect("first event should read from stream");
  let first_interaction = HttpInteraction::from_json_str(&first_event)
    .expect("line in stream must parse as HttpInteraction");
  assert_eq!(&first_interaction.uuid, "3");
  let second_event = lines
    .next()
    .await
    .expect("there should still be events left")
    .expect("second event should read from stream");
  let second_interaction = HttpInteraction::from_json_str(&second_event)
    .expect("line in stream must parse as HttpInteraction");
  assert_eq!(&second_interaction.uuid, "4");
  let remaining_events = lines.take(3).collect::<Vec<_>>().await;
  assert_eq!(remaining_events.len(), 2);
}
