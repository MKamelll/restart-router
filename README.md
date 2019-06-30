### A cli to restart a huawei router

It could work for other routers if you changed the css selectors to match
your router.

`git clone https://github.com/MKamelll/restart-router.git`

Run `npm install -g` in the folder.

You can now restart using `restr`, it's going to ask for
credentials first time only and saves your info in a `.json`
file. In case you want to reset, run `restr --reset` and it
will delete the file and ask for new credentials.
