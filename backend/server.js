import express from 'express';
import cors from 'cors';
import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
import { createRemoteJWKSet, jwtVerify } from 'jose';

dotenv.config();

const DB_SCHEMA = process.env.DB_SCHEMA || 'app';
const useSsl = process.env.PGSSLMODE === 'require';
const ASGARDEO_ORG = process.env.ASGARDEO_ORG || 'orgzyr7r';
const JWKS_URL = `https://api.asgardeo.io/t/${ASGARDEO_ORG}/oauth2/jwks`;
const JWKS = createRemoteJWKSet(new URL(JWKS_URL));

const app = express();
app.use(cors());
app.use(express.json());

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  dialect: 'postgres',
  dialectOptions: useSsl ? { ssl: { require: true, rejectUnauthorized: false } } : undefined,
  define: { schema: DB_SCHEMA },
});

const Puppy = sequelize.define('puppies', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
  name: { type: DataTypes.TEXT, allowNull: false },
  breed: { type: DataTypes.TEXT, allowNull: false },
  age: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.STRING, allowNull: true },
}, {
  schema: DB_SCHEMA,
  tableName: 'puppies',
  timestamps: false,
});

// Auth middleware
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }
  const token = authHeader.slice(7);
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://api.asgardeo.io/t/${ASGARDEO_ORG}/oauth2/token`,
    });
    req.userId = payload.sub;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

app.get('/', (req, res) => res.send('Hello World!'));

// Protected routes
app.get('/puppies', authMiddleware, async (req, res) => {
  try {
    const puppies = await Puppy.findAll({ where: { user_id: req.userId } });
    res.status(200).json(puppies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/puppies/:id', authMiddleware, async (req, res) => {
  try {
    const puppy = await Puppy.findOne({ where: { id: req.params.id, user_id: req.userId } });
    if (!puppy) return res.status(404).json({ error: 'Puppy not found' });
    res.status(200).json(puppy);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/puppies', authMiddleware, async (req, res) => {
  try {
    const { name, breed, age } = req.body;
    const puppy = await Puppy.create({ name, breed, age, user_id: req.userId });
    res.status(201).json(puppy);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/puppies/:id', authMiddleware, async (req, res) => {
  try {
    const puppy = await Puppy.findOne({ where: { id: req.params.id, user_id: req.userId } });
    if (!puppy) return res.status(404).json({ error: 'Puppy not found or not yours' });
    const { name, breed, age } = req.body;
    await puppy.update({ name, breed, age });
    res.status(200).json(puppy);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/puppies/:id', authMiddleware, async (req, res) => {
  try {
    const puppy = await Puppy.findOne({ where: { id: req.params.id, user_id: req.userId } });
    if (!puppy) return res.status(404).json({ error: 'Puppy not found or not yours' });
    await puppy.destroy();
    res.status(200).json({ message: `Puppy ${req.params.id} deleted successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected...');
    await Puppy.sync({ alter: true });
    console.log(`Puppy model synced in schema "${DB_SCHEMA}".`);
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
  } catch (err) {
    console.error('Error: ', err);
    process.exit(1);
  }
};

startServer();