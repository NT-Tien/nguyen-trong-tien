import { Request, Response } from 'express';
import { UserModel } from '../models/User';

const userModel = new UserModel();

export const index = async (req: Request, res: Response): Promise<void> => {
  console.log('Query params:', req.query);
  const paginatedUsers = await userModel.getUsersWithSearch(req.query);
  console.log('Paginated users:', { total: paginatedUsers.total, count: paginatedUsers.users.length });
  res.render('index', {
    title: 'Quản lý người dùng - Express MVC TypeScript',
    ...paginatedUsers,
    query: req.query
  });
};

export const about = (req: Request, res: Response): void => {
  res.render('about', { 
    title: 'Giới thiệu',
    description: 'Ứng dụng Express TypeScript với kiến trúc MVC'
  });
};

export const contact = (req: Request, res: Response): void => {
  res.render('contact', { 
    title: 'Liên hệ' 
  });
};

export const getUserDetail = async (req: Request, res: Response): Promise<void> => {
  const user = await userModel.getUserById(req.params.id);
  
  if (user) {
    res.render('user-detail', { 
      title: `Thông tin - ${user.name}`, 
      user 
    });``
  } else {
    res.status(404).render('404', { 
      title: 'Không tìm thấy người dùng' 
    });
  }
};

export const createUserForm = (req: Request, res: Response): void => {
  res.render('create-user', { 
    title: 'Thêm người dùng mới' 
  });
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email } = req.body;
    await userModel.createUser(name, email);
    res.redirect('/');
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi tạo người dùng' });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    const updated = await userModel.updateUser(id, name, email);
    if (updated) {
      res.json({ success: true, user: updated });
    } else {
      res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi cập nhật người dùng' });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await userModel.deleteUser(id);
    if (deleted) {
      res.json({ success: true, message: 'Xóa người dùng thành công' });
    } else {
      res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi xóa người dùng' });
  }
};
