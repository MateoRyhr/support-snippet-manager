import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import snippetRoutes from './routes/snippet.routes.js';
import { globalErrorHandler } from './middleware/errorMiddleware.js'; // Importar aquí

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API is running beautifully' });
});

app.use('/snippets', snippetRoutes);

app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
});