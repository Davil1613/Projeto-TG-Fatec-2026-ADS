
import 'dotenv/config';
import './models/initModels';
import express from 'express';
import routes from './routes';
import swagger from './swagger';
import cors from 'cors';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json({ limit: '12mb' }));
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

swagger(app);
routes(app);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
