import express from 'express';
import cors from 'cors';
import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const bearerToken = 'Bearer aaa.eyJzdWIiOiIxMjMifQ.bbb';
const token = bearerToken.slice(7);
const [header, payload, signature] = token.split('.');

if (token) {
  console.log('TOKEN HAS A VALUE');
} else {
  console.log('Token has no value');
}

console.log('Bearer Token:', bearerToken);
console.log('Token:', token);
console.log('Header:', header);
console.log('Payload:', payload);
console.log('Signature:', signature);

const DB_SCHEMA = process.env.DB_SCHEMA || 'app';
const useSsl = process.env.PGSSLMODE === 'require';

const app = express();

app.use(cors());
app.use(express.json());

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  dialect: 'postgres',
  dialectOptions: useSsl
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : undefined,
  define: {
    schema: DB_SCHEMA,
  },
});

const Puppy = sequelize.define('puppies', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  breed: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  schema: DB_SCHEMA,
  tableName: 'puppies',
  timestamps: false,
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected...');
    await Puppy.sync({ alter: true });
    console.log(`Puppy model synced in schema "${DB_SCHEMA}".`);
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Error: ', err);
    process.exit(1);
  }
};

startServer();