"use strict";
(function(){

  const os = require('os');
  const fs = require('fs');
  const path = require('path');
  const rmdir = require('rmdir');
  const zlib = require('zlib');
  const tar = require('tar-fs');
  const process = require('process');
  const request = require('request');
  const ProgressBar = require('progress');
  const child_process = require('child_process');
  const {jreDirectory} = require('../config')

  if (!fs.existsSync(jreDirectory)){ //create jre directory if it does not exist
      fs.mkdirSync(jreDirectory);
  }

  const appRootPath = require('app-root-path')

  const {major_version, update_number, build_number, hash} = require('../../package').jreConfig

  const version = major_version + 'u' + update_number;

  const name = `jre1.${major_version}.0_${update_number}`

  const jreDir = exports.jreDir = () => path.join(jreDirectory);
  const jreName = exports.jreName = () => jreDir()+`/${name}`

  const fail = reason => {
    console.error(reason);
    process.exit(1);
  };

  var _arch = os.arch();
  switch (_arch) {
    case 'x64': break;
    case 'ia32': _arch = 'i586'; break;
    default:
      fail('unsupported architecture: ' + _arch);
  }
  const arch = exports.arch = () => _arch;

  var _platform = os.platform();
  var _driver;
  switch (_platform) {
    case 'darwin': _platform = 'macosx'; _driver = ['Contents', 'Home', 'bin', 'java']; break;
    case 'win32': _platform = 'windows'; _driver = ['bin', 'javaw.exe']; break;
    case 'linux': _driver = ['bin', 'java']; break;
    default:
      fail('unsupported platform: ' + _platform);
  }
  const platform = exports.platform = () => _platform;

  const getDirectories = dirPath => fs.readdirSync(dirPath).filter(
    file => fs.statSync(path.join(dirPath, file)).isDirectory()
  );

  const driver = exports.driver = () => {
    var jreDirs = getDirectories(jreDir());
    if (jreDirs.length < 1)
      fail('no jre found in archive');
    var d = _driver.slice();
    d.unshift(jreDirs[0]);
    d.unshift(jreDir());
    return path.join.apply(path, d);
  };

  const getArgs = exports.getArgs = (classpath, classname, args) => {
    args = (args || []).slice();
    classpath = classpath || [];
    args.unshift(classname);
    args.unshift(classpath.join(platform() === 'windows' ? ';' : ':'));
    args.unshift('-cp');
    return args;
  };

  const spawn = exports.spawn =
    (classpath, classname, args, options) =>
      child_process.spawn(driver(), getArgs(classpath, classname, args), options);

  const spawnSync = exports.spawnSync =
    (classpath, classname, args, options) =>
      child_process.spawnSync(driver(), getArgs(classpath, classname, args), options);

  const smoketest = exports.smoketest = () => {
      const p = path.join(__dirname, '../../resources')
	  return spawnSync([p], 'Smoketest', [], {encoding: 'utf8'})
		  .stdout.trim() === 'No smoke!';
  }

  const url = exports.url = () =>
    'https://download.oracle.com/otn-pub/java/jdk/' +
    version + '-b' + build_number + '/' + hash +
    '/jre-' + version + '-' + platform() + '-' + arch() + '.tar.gz';

  const install = exports.install = (callback, clean = false) => {

    if (fs.existsSync(jreName()) && smoketest() && ! clean) {
      console.log('Valid version of JRE already installed')
      callback()
      return
    }

    var urlStr = url();
    // console.log("Downloading from: ", urlStr);
    callback = callback || (() => {});
    rmdir(jreDir());
    request
      .get({
        url: url(),
        rejectUnauthorized: false,
        agent: false,
        headers: {
          connection: 'keep-alive',
          'Cookie': 'gpw_e24=http://www.oracle.com/; oraclelicense=accept-securebackup-cookie'
        }
      })
      .on('response', res => {
        var len = parseInt(res.headers['content-length'], 10);
        var bar = new ProgressBar('downloading Optic Server [:bar] :percent :etas', {
          complete: '=',
          incomplete: ' ',
          width: 80,
          total: len
        });
        res.on('data', chunk => bar.tick(chunk.length));
      })
      .on('error', err => {
        console.log(`problem with request: ${err.message}`);
        callback(err);
      })
      .on('end', () => {
        try{
          if (smoketest()) callback(); else callback("Smoketest failed.");
        }catch(err){
          callback(err);
        }
      })
      .pipe(zlib.createUnzip())
      .pipe(tar.extract(jreDir(), {
		  map: function(header) {
			  header.name = header.name.replace(`${name}.jre/`, `${name}/`)
			  return header
		  }
      }));
  };

})();
