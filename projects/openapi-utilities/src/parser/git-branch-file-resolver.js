"use strict";
const fs = require("fs");
const { ono } = require("@jsdevtools/ono");
const url = require("@apidevtools/json-schema-ref-parser/lib/util/url");
const { ResolverError } = require("@apidevtools/json-schema-ref-parser/lib/util/errors");
const exec = require('child_process').exec
const path = require("path")

module.exports = (gitBaseRepo, branch) => ({
  /**
   * The order that this resolver will run, in relation to other resolvers.
   *
   * @type {number}
   */
  order: 1,

  /**
   * Determines whether this resolver can read a given file reference.
   * Resolvers that return true will be tried, in order, until one successfully resolves the file.
   * Resolvers that return false will not be given a chance to resolve the file.
   *
   * @param {object} file           - An object containing information about the referenced file
   * @param {string} file.url       - The full URL of the referenced file
   * @param {string} file.extension - The lowercased file extension (e.g. ".txt", ".html", etc.)
   * @returns {boolean}
   */
  canRead (file) {
    return url.isFileSystemPath(file.url);
  },

  /**
   * Reads the given file and returns its raw contents as a Buffer.
   *
   * @param {object} file           - An object containing information about the referenced file
   * @param {string} file.url       - The full URL of the referenced file
   * @param {string} file.extension - The lowercased file extension (e.g. ".txt", ".html", etc.)
   * @returns {Promise<Buffer>}
   */
  read (file) {

    return new Promise(((resolve, reject) => {
      const toGit = path.relative(gitBaseRepo, file.url)
      const command = `git show ${branch}:${toGit}`
      try {
        exec(command, {cwd: gitBaseRepo}, ((err, stdout, stderr) => {
          if (err) reject(new ResolverError(ono(err, `Error opening file "${path}"`), path));
          if (stdout) resolve(stdout)
        }))
      }
      catch (err) {
        reject(new ResolverError(ono(err, `Error opening file "${path}"`), path));
      }
    }));
  }
});
