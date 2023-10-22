import cors from 'cors';

var corsOptions = {
  origin: '*',
  methods: [ "POST", "GET", "OPTIONS" ],
  allowedHeaders: [ "Content-Type", "X-Token", "X-Requested-With" ]
};

export default cors(corsOptions);
