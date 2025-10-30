import express, { Application, Request, Response, NextFunction } from 'express';
import path from 'path';
import indexRouter from './routes/index';

const app: Application = express();
const PORT = process.env.PORT || 3000;

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', indexRouter);

// 404 Error Handler
app.use((req: Request, res: Response) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

// Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).render('error', { title: 'Error', error: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});

export default app;
