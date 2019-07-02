# Running Seamless Locally

We believe that it is important for you to control your API specification, so we do not require you to save them in our cloud. We built a lightweight CLI that lets anyone on your team view and edit the spec by running 'api spec.' Like everything else we have built, it is open source and free to use. All the data is checked into your git repo and the computation done locally.


> If you have the API Designer open in your browser click 'Share' and follow these instructions.

1. Install the CLI from NPM
```bash
npm install @seamlessapis/cli -g
```

2. Initialize a Seamless Spec in your Repo.
Now we need to initialize Seamless in your repo.
```bash
cd /path/to/api/
api init
```

You will see a folder called '.api'. This stores a changelog of all the changes made to your API. There is also a ReadMe to help your teammates get setup. You might want to add a few lines at the top explaining what you like and dislike about Seamless.


3. Open the editor locally
```bash
api spec
```

That's it! Your team can now use Seamless to design and document your internal APIs!
