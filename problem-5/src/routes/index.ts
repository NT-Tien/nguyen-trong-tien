import { Router } from 'express';
import * as homeController from '../controllers/homeController';

const router = Router();

// Home routes
router.get('/', homeController.index);
router.get('/about', homeController.about);
router.get('/contact', homeController.contact);

// User routes
router.get('/user/:id', homeController.getUserDetail);
router.get('/create-user', homeController.createUserForm);
router.post('/create-user', homeController.createUser);
router.put('/user/:id', homeController.updateUser);
router.delete('/user/:id', homeController.deleteUser);

export default router;
