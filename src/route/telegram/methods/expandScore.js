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
  let scoreInstance = await saveScore(score, sessionInstance);
  return {
    result: scoreInstance.score
  };
}

function getScore(passedIslands, sessionInstance) {
  if (!isType('Object', passedIslands)) {
    throw new HttpError();
  }
  let block = passedIslands;
  let _prevT = 0;
  let _it = 0;
  let _iterRestrict = 1e6;
  let score = 0;
  do {
    score = getScoreFromBlock(block, sessionInstance.createdAt, _prevT);
    _prevT = block._t;
    block = block._n;
    ++_it;
  } while (block && _iterRestrict > _it);
  return score;
}

function getScoreFromBlock(block, sessionCreatedAt, prevT) {
  let { _f, _p, _r, _s, _t } = block || {};
  
  if (!Array.isArray(_f) || _f.length !== 2) {
    throw new HttpError();
  } else if (_p > 1 || _p < 0) {
    throw new HttpError();
  } else if (_r > 1 || _r < 0) {
    throw new HttpError();
  } else if (new Date(sessionCreatedAt) > new Date(_t) || _t < prevT) {
    throw new HttpError();
  } else if (typeof _s !== 'string') {
    throw new HttpError();
  }
  return parseInt(_s, 20);
}

async function saveScore(score = 0, sessionInstance) {
  score = Math.min(1e5, Math.max(0, score));
  return Highscore.create({
    chatId: sessionInstance.chat_instance,
    userId: sessionInstance.from_id,
    score
  });
}