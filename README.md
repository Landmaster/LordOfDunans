# Lord of Dunans
Strategy-Combat Game *(work in progress)*

**TODO detail game mechanics**
## Setup
After cloning this repository, create `private` and `db` folders in the root of the repository directory.

In the `db` folder, set up a MongoDB database called `lordofdunans` and add (1) an admin account on the `admin` database for the server operator, and (2) an account named `loginManager` on the `lordofdunans` database for managing the database contents.

In the `private` folder, add two files. The first is the `auth.json` file, which should have the lines
```
{
  "loginManager": "password for the loginManager MongoDB account"
}
```
where `password for the loginManager MongoDB account` should be replaced with the `loginManager` MongoDB account's password.  The second is the `session_info.txt` file; type in a single line of random characters in that file (about 65 characters) which will be the token for login sessions.

Run `npm update` to install dependencies for Lord of Dunans.

### Actually running the server

Run `npm run start-database` to start the MongoDB database.

In a separate shell, run `npm run build-debug` to create a debug build of the client JavaScript files (i.e. which allows debugging using sourcemaps) or `npm run build` to create a minified build. Run `npm run start-server` to start the main server.

Use `npm run clean` to automatically delete the output JavaScript file (and possibly the sourcemap) to prepare for a new build. 

## License
Lord of Dunans is licensed under the AGPL v3.
## Credits
Main Developer: @Landmaster
