#!/usr/bin/env bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
mongod --dbpath "$DIR/db" --port 27017 --auth &
mongo_pid=$!
function cleanup {
    echo "Ending MongoDB instance"
    kill ${mongo_pid}
}
trap cleanup EXIT
while kill -0 ${mongo_pid} ; do
    sleep 1
done