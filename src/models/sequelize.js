import Sequelize from 'sequelize';
import chalk from 'chalk';

require('dotenv').config()

const isDevelopment = process.env.NODE_ENV === 'development'

const logger = (query, timing) => {
  console.log(`${chalk.hsl(330, 100, 70)('[%d ms]')} ` + `${chalk.cyanBright.bold('%s')}`, timing, query);
};

const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USERNAME,
  process.env.DATABASE_PASSWORD, {
    host: process.env.DATABASE_HOST,
    dialect: 'mysql',
    benchmark: isDevelopment,
    logging: isDevelopment ? logger : false,
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      engine: 'InnoDB'
    },
    dialectOptions: {
      supportBigNumbers: true
    },
    pool: {
      min: 0,
      max: 100,
      idle: 30000
    }
  });

export default sequelize;
