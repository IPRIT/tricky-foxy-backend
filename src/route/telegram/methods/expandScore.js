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
  console.log(passedIslands);
  return passedIslands;
}