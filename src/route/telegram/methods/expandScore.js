import Promise from 'bluebird';
import { typeCheck as isType } from 'type-check';
import deap from 'deap';
import lodash from 'lodash';
import request from 'request-promise';
import { config, md5 } from '../../../utils';
import Sequelize from 'sequelize';
import { Session, Highscore } from '../../../models';
import Encryption from 'one-encryption';

const encryption = new Encryption();
var defaultEncryptionConfig = {
  algorithm : 'aes-256-ecb'
};

export default (req, res, next) => {
  let { body } = req;
  handle(body).then(result => {
    res.json(result);
  }).catch(next);
}

async function handle(_data) {
  let { session = '', hash } = _data;
  let sessionInstance = await Session.findOne({
    where: {
      sessionId: session
    }
  });
  if (!sessionInstance) {
    throw new HttpError('Session not found');
  }
  let shard = md5(`${sessionInstance.from_id}->${config.encryption.salt}`);
  let encryptionConfig = deap.extend({
    key: shard
  }, defaultEncryptionConfig);
  let decrypted = encryption.decrypt(encryptionConfig, hash);
  let passedIslands = JSON.parse(decrypted.split('').reverse().join(''));
  let score = getScore(passedIslands, sessionInstance);
  return {
    result: score
  };
}

function getScore(passedIslands, sessionInstance) {
  if (!isType('Object', passedIslands)) {
    throw new HttpError();
  }
  let block = passedIslands;
  let _it = 0;
  let _iterRestrict = 1e6;
  let score = 0;
  do {
    score = getScoreFromBlock(block, sessionInstance.createdAt);
    block = block._n;
    ++_it;
  } while (block && _iterRestrict > _it);
  return score;
}

function getScoreFromBlock(block, sessionCreatedAt) {
  let { _f, _p, _r, _s, _t } = block || {};
  
  if (!Array.isArray(_f) || _f.length !== 2) {
    throw new HttpError('f');
  } else if (_p > 1 || _p < 0) {
    throw new HttpError('p');
  } else if (_r > 1 || _r < 0) {
    throw new HttpError('r');
  } else if (new Date(sessionCreatedAt) > new Date(_t)) {
    throw new HttpError('t');
  } else if (typeof _s !== 'string') {
    throw new HttpError('s');
  }
  return parseInt(_s, 20);
}