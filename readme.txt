npm install --global --production windows-build-tools

npm config set msvs_version 2015

npm config set python /path/to/executable/python2.7


// Install mongodb from http://www.mongodb.org/downloads

curl -O https://fastdl.mongodb.org/osx/mongodb-osx-x86_64-3.2.7.tgz
tar -zxvf mongodb-osx-x86_64-3.2.7.tgz

mv mongodb-osx-x86_64-3.2.7/ mongodb

export PATH=<mongodb-install-directory>/bin:$PATH

// Create the data directory
mkdir -p /data

// Specify the path of the data directory
mongod --dbpath <path to data directory>
