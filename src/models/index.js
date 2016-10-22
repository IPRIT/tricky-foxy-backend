import Log from 'log4js';
import sequelize from './sequelize';
import Session from './Session';
import Highscore from './Highscore';

const log = Log.getLogger('models');

log.info('Models are syncing...');
sequelize.sync(/**{ force: true }/**/).then(() => {
  log.info('Models synced!');
}).catch(log.fatal.bind(log, 'Error:'));

/**
 * Define relatives between models
 */
Session.hasMany(Highscore, { foreignKey: 'sessionId', targetKey: 'id' });

export {
  Session, Highscore
};
