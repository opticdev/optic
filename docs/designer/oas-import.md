# Importing OpenAPI / Swagger 

Seamless makes it easy to import your existing OpenAPI/Swagger specifications. There are only a few requirements:
- Must be using Swagger 2 or OpenAPI 3
- You may upload either valid JSON or YAML
- If your spec does not validate on [https://editor.swagger.io/](https://editor.swagger.io/) the import will fail. 
- External file/url references are not currently supported. You can use internal references, but everything must live in the same file. You probably have a build script to combine multiple specs -- **upload the artifact**. 

## Steps to Import
1. Go to https://editor.seamlessapis.com/upload-oas
2. Upload your OAS spec file
3. Wait a few seconds...and you'll be redirected to the API Designer with your API loaded in. 

There are some known limitations to the [importer detailed here](). We used the dataset of OAS specs on API Guru to prioritize the most used features of OAS. If we your spec did not import correctly please [open an issue]() (it shouldn't be hard to fix).


### Saving the Seamless Spec
Seamless is designed to run locally from your repo. Once you've imported your OAS Spec, [follow these instructions](designer/cli.md) to learn how to add the spec to your repo.  

