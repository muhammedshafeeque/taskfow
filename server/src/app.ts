import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { apiRoutes } from './routes';
import { errorHandler } from './middleware/errorHandler';
import morgan from 'morgan';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/api/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/api', apiRoutes);

app.use(errorHandler);

export default app;
