import Log from 'log4js';
import sequelize from './sequelize';

const log = Log.getLogger('models');

log.info('Models are syncing...');
sequelize.sync(/**{ force: true }/**/).then(() => {
  log.info('Models synced!');
}).catch(log.fatal.bind(log, 'Error:'));

/**
 * Define relatives between models
 */
//todo

export {
};
