import Sequelize from 'sequelize';
import sequelize from '../sequelize';

let Highscore = sequelize.define('Highscore', {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  chatId: {
    type: Sequelize.STRING,
    allowNull: false
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  score: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  }
}, {
  engine: 'MYISAM',
  indexes: [{
    name: 'score_index',
    fields: [ 'score' ]
  }, {
    name: 'user_index',
    fields: [ 'userId' ]
  }, {
    name: 'chat_index',
    fields: [ 'chatId' ]
  }]
});

export default Highscore;