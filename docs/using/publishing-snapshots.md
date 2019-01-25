# Publishing Snapshots
Optic analyses your API and creates an API Spec (convertible to Swagger, RAML or API Blueprint) describing each endpoints and model. Each of these specs is uploaded as a 'snapshot' of your API at its current state of development.


## Staging Draft APIs
Before publishing a snapshot you can review the API Spec to make sure it's correct. To create and upload a draft of your API Spec run the `stage` command. Team members are not notified about changes in draft snapshots -- this command is safe and is strictly for testing/debugging. 
```bash
cd /path/to/repo # should contain optic.yaml
optic stage
``` 


## Publishing 
When you are ready to actually publish a new version of your API to Optic run: 
```bash
cd /path/to/repo # should contain optic.yaml
optic publish
``` 

Your snapshot will be named after the current Git branch / commit, and because published snapshots are immutable, the CLI will not allow you to publish if your project's Git repo is dirty. 

Once published: 
- Team members who have subscribed to this API will get notified of important changes
- (beta) Pull requests will be made to update clients that consume this API

