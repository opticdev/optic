# Optic 

> Make APIs developer friendly

[Roadmap](https://docs.useoptic.com/#/roadmap)

## Get Started

1. [Try Optic in the browser](https://design.useoptic.com)
2. Add Otic to your API Repo
```bash
npm install @useoptic/cli -g

cd /path/to/api/repo
# Add Optic to your repo. Make sure you check in the new files. 
api init

# Then start the local editor by running
api spec
```

## Project Structure 

```
├── api-cli   # The CLI to run Optic locally
├── docs      # Project documentation 
├── domain    # The Optic API Spec
├── oas       # The OpenAPI / Swagger Importer
└── ui        # The API Designer 
```

## License 
MIT License 
