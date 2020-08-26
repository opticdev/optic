use clap::{App, Arg};
use optic_diff::diff_interaction;
use optic_diff::errors;
use optic_diff::streams;
use optic_diff::Aggregate;
use optic_diff::EndpointProjection;
use optic_diff::HttpInteraction;
use optic_diff::SpecEvent;
use std::process;
use tokio::io::stdin;
use tokio::stream::StreamExt;

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

    let mut endpoints_projection = EndpointProjection::default();
    for event in events {
        endpoints_projection.apply(event)
    }
    let mut runtime = tokio::runtime::Runtime::new().unwrap();
    runtime.block_on(async {
        let stdin = stdin(); // TODO: deal with std in never having been attached
        let mut interaction_lines = streams::http_interaction::json_lines(stdin);

        while let Some(interaction_json_result) = interaction_lines.next().await {
            let interaction_json = interaction_json_result.unwrap(); // TODO: deal with error handling
            let interaction = HttpInteraction::from_json_str(&interaction_json).unwrap(); // TODO: deal with error handling
            let results = diff_interaction(&mut endpoints_projection, interaction);
            println!("{:?}", results);
        }
    })
}

#[cfg(test)]
mod test {
    #[test]
    pub fn do_a_diff() {
        assert_eq!(true, true, "wouldn't you know");
    }
}
