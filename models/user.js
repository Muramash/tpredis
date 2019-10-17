const Redis = require("ioredis");
const redis = new Redis(
  process.env.REDIS_PORT || 6379,
  process.env.REDIS_HOST || "127.0.0.1"
);
const table_user = "user:";
const uuidv4 = require("uuid/v4");

module.exports = {
  get: userId => {
    return (
      redis
        // @ts-ignore
        .hgetall(table_user + userId)
        .then(resolve => {
          return resolve;
        })
        .catch(reject => {
          console.log(new Error(reject));
        })
    );
  },

  count: () => {
    var stream = redis.scanStream({ match: "user:*", count: 10000 });
    return new Promise(function(resolve, reject) {
      stream.on("data", resultkey => {
        console.log("count = " + resultkey.length);
        resolve(resultkey.length);
      });
    });
  },

  getAll: (limit, offset) => {
    // hgetall: Get all the fields and values in a hash
    let response = [];
    var stream = redis.scanStream({
      match: "user:*",
      count: limit === undefined ? 10000 : limit
    });

    return new Promise(function(resolve, reject) {
      stream.on("data", resultkey => {
        Promise.all(
          resultkey.map(async element => {
            return new Promise(function(resolve, reject) {
              let UserId = element.split(":")[1];
              let object1 = { rowid: UserId };
              resolve(
                redis.hgetall(table_user + UserId).then(resolve => {
                  response.push(Object.assign(object1, resolve));
                })
              );
            });
          })
        ).then(_resovle => {
          resolve(response);
        });
      });
    });
  },

  insert: params => {
    let UserId = uuidv4();
    console.log(UserId);
    return redis
      .hmset(table_user + UserId, params)
      .then(resolve => {
        return resolve;
      })
      .catch(reject => {
        console.log(new Error(reject));
      });
  },

  update: (userId, params) => {
    const possibleKeys = [
      "firstname",
      "lastname",
      "email",
      "pseudo",
      "password"
    ];
    console.log("userId = " + userId);
    if (
      Object.keys(params).length === possibleKeys.length &&
      Object.keys(params).every(element => {
        return possibleKeys.includes(element);
      })
    ) {
      return redis
        .hmset(table_user + userId, params)
        .then(resolve => {
          return resolve;
        })
        .catch(reject => {
          console.log(new Error(reject));
        });
    } else {
      let err = new Error("Bad Request");
      err.status = 400;
      return Promise.reject(err);
    }
  },

  remove: userId => {
    return redis
      .del(table_user + userId)
      .then(resolve => {
        return resolve;
      })
      .catch(reject => {
        console.log(new Error(reject));
      });
  }
};
