use clap::{App, Arg};
use futures::SinkExt;
use optic_diff::diff_interaction;
use optic_diff::errors;
use optic_diff::streams;
use optic_diff::EndpointProjection;
use optic_diff::HttpInteraction;
use optic_diff::SpecEvent;
use std::process;
use std::sync::Arc;
use tokio::io::{stdin, stdout};
use tokio::stream::StreamExt;
use tokio::sync::mpsc;

fn main() {
    let cli = App::new("Optic Diff engine")
        .version("1.0")
        .author("Optic Labs Corporation")
        .about("Detects differences between API spec and captured interactions")
        .arg(
            Arg::with_name("specification")
                .required(true)
                .value_name("spec-file-path")
                .help("Sets the specification file that describes the API spec")
                .takes_value(true),
        );

    let matches = cli.get_matches();

    let spec_file_path = matches
        .value_of("specification")
        .expect("spec-file-path should be required");
    let events = SpecEvent::from_file(spec_file_path)
        .map_err(|err| match err {
            errors::EventLoadingError::Io(err) => {
                eprintln!("Could not read specification file: {}", err);
                process::exit(1);
            }
            errors::EventLoadingError::Json(err) => {
                eprintln!("Specification JSON file could not be parsed: {}", err);
                process::exit(1);
            }
            _ => unreachable!("Specification file not currently serialized as any other but JSON"),
        })
        .unwrap();

    let endpoints_projection = Arc::new(EndpointProjection::from_events(events.into_iter()));

    let mut runtime = tokio::runtime::Runtime::new().unwrap();
    runtime.block_on(async {
        let stdin = stdin(); // TODO: deal with std in never having been attached

        let mut interaction_lines = streams::http_interaction::json_lines(stdin);

        let (results_sender, mut results_receiver) = mpsc::channel(32); // buffer 32 results
        let results_manager = tokio::spawn(async move {
            let stdout = stdout();
            let mut results_sink = streams::diff::into_json_lines(stdout);

            while let Some(result) = results_receiver.recv().await {
                if let Err(_) = results_sink.send(result).await {
                    panic!("could not write diff result to stdout"); // TODO: Find way to actually write error info
                }
            }
        });

        while let Some(interaction_json_result) = interaction_lines.next().await {
            let projection = endpoints_projection.clone();
            let mut results_sender = results_sender.clone();

            tokio::spawn(async move {
                let interaction_json =
                    interaction_json_result.expect("can read interaction json line from stdin");
                let TaggedValue(interaction, tags): TaggedValue<HttpInteraction> =
                    match serde_json::from_str(&interaction_json) {
                        Ok(tagged_interaction) => tagged_interaction,
                        Err(parse_error) => {
                            eprintln!("could not parse interaction json: {}", parse_error);
                            return ();
                        }
                    };

                // TODO: consider passing it task::yield_now, to allow traverser to yield when it detect
                // big traversals.
                let results = diff_interaction(&projection, interaction);
                for result in results {
                    if let Err(_) = results_sender.send(TaggedValue(result, tags.clone())).await {
                        panic!("could not write diff result to results channel");
                        // TODO: Find way to actually write error info
                    }
                }
            });
        }

        drop(results_sender);
        results_manager.await.unwrap(); // make sure the results manager is done flushing
    })
}

#[derive(Debug, serde::Deserialize, serde::Serialize)]
struct TaggedValue<T>(T, Vec<String>);

#[cfg(test)]
mod test {
    #[test]
    pub fn do_a_diff() {
        assert_eq!(true, true, "wouldn't you know");
    }
}
