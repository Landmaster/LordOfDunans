# Lord of Dunans
A (work-in-progress) strategy-combat game where you control a character, summon towers, and battle alongside summoned entities to defend your side of the field from the enemy.

## Caveats
As of August 2018, this game is still in the early stages of its development. Use at your own risk.

## Setup
After cloning this repository, create a `db` folder in the root of the repository directory.

In the `db` folder, set up a MongoDB database called `lordofdunans` and add (1) an admin account on the `admin` database for the server operator, and (2) an account named `loginManager` on the `lordofdunans` database for managing the database contents.

Set the environment variable "LOD_LOGIN_MANAGER" to the password for the loginManager MongoDB account.

Set the environment variable "LOD_SESSION_TOKEN" to a series of random characters (about 65 characters) which will be the token for login sessions.

Run `npm update` to install dependencies for Lord of Dunans.

### Actually running the server

Run `npm run start-database` to start the MongoDB database.

In a separate shell, run `npm run build-debug` to create a debug build of the client JavaScript files (i.e. which allows debugging using sourcemaps) or `npm run build` to create a minified build. Run `npm run start-server` to start the main server.

Use `npm run clean` to automatically delete the output JavaScript file (and possibly the sourcemap) to prepare for a new build. 

## License
Lord of Dunans is licensed under the AGPL v3.

## Credits
Main Developer: @Landmaster
