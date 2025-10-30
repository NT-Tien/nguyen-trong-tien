# 🎯 CRUD User Management with Search Tool

User management application built with Express TypeScript MVC, integrated with MongoDB and powerful search utilities.

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Make sure MongoDB is running
mongod

# 3. Start development server
npm run dev

# 4. Open browser
# Navigate to http://localhost:3000
```

## ✨ Features

### 🔍 Advanced Search (Search Tool)
The `src/utils/search.tool.ts` file provides various search operators:

- **contains**: Find substring (e.g., `search[name:contains]=John`)
- **equal**: Exact match (e.g., `search[email:equal]=john@example.com`)
- **beginsWith**: Starts with (e.g., `search[name:beginsWith]=J`)
- **endsWith**: Ends with (e.g., `search[email:endsWith]=@gmail.com`)
- **in**: Find in list (e.g., `search[status:in]=active,pending`)
- **between**: Range search (e.g., `search[age:between]=18,65`)
- **gt, gte, lt, lte**: Number comparison (e.g., `search[age:gte]=18`)
- **exists, notExists**: Check field existence
- **notEqual, notIn, notContain**: Inverse search

### 📊 Sorting
- Sort by any field: `sort[name]=asc` or `sort[name]=desc`
- Default sorting by `created_at` in descending order

### 📄 Pagination
- `page`: Page number (default: 1)
- `limit`: Records per page (default: 10)

### ⚡ CRUD Operations
- **Create**: Add new user
- **Read**: View list and details
- **Update**: Update user information
- **Delete**: Remove user

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Step 1: Clone the repository
```bash
git clone <repository-url>
cd problem-5
```

### Step 2: Install dependencies
```bash
npm install
# or
yarn install
```

### Step 3: Configure MongoDB
Make sure MongoDB is running on your local machine or update the connection string in `src/common/mongodb.service.ts`:

```typescript
// Default connection
mongodb://localhost:27017/your-database-name
```

### Step 4: Run the application

**Development mode (with auto-reload):**
```bash
npm run dev
# or
yarn dev
```

**Simple development mode:**
```bash
npm run dev:simple
# or
yarn dev:simple
```

**Production mode:**
```bash
# Build the project
npm run build
# or
yarn build

# Start the server
npm start
# or
yarn start
```

### Step 5: Access the application
Open your browser and navigate to:
```
http://localhost:3000
```

## 🔧 Configuration

### MongoDB Connection
Edit `src/common/mongodb.service.ts` to configure your MongoDB connection:

```typescript
private url = 'mongodb://localhost:27017';
private dbName = 'your-database-name';
```

### Port Configuration
The default port is `3000`. You can change it by setting the `PORT` environment variable:

```bash
PORT=8080 npm run dev
```

## 📝 API Examples

### Search users by name
```
GET /?search[name:contains]=John
```

### Search by email
```
GET /?search[email:contains]=@gmail.com
```

### Search with sorting
```
GET /?search[name:contains]=John&sort[email]=asc
```

### Search with pagination
```
GET /?search[name:contains]=John&page=2&limit=20
```

### Find users created within date range
```
GET /?search[createdAt:between]=2024-01-01,2024-12-31
```

### API Endpoints

#### GET /
Get user list with search and pagination

#### POST /create-user
Create new user
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

#### PUT /user/:id
Update user
```json
{
  "name": "John Updated",
  "email": "john.updated@example.com"
}
```

#### DELETE /user/:id
Delete user

## 🎨 UI Features

- ✅ Modern interface with gradients
- ✅ Real-time search
- ✅ Create/edit user modal
- ✅ Sorting by clicking headers
- ✅ Smart pagination
- ✅ Responsive design
- ✅ Delete confirmation

## 🛠️ Tech Stack

- **Backend**: Express + TypeScript
- **Database**: MongoDB
- **View Engine**: EJS
- **Architecture**: MVC Pattern
- **Search**: Custom Search Tool with MongoDB Query

## 📁 Project Structure

```
problem-5/
├── src/
│   ├── app.ts                      # Entry point - Express app setup
│   ├── common/
│   │   └── mongodb.service.ts      # MongoDB connection service
│   ├── controllers/
│   │   └── homeController.ts       # CRUD operations logic
│   ├── models/
│   │   └── User.ts                 # User model with search integration
│   ├── routes/
│   │   └── index.ts                # API route definitions
│   ├── utils/
│   │   └── search.tool.ts          # Advanced search query builder
│   └── views/
│       └── index.ejs               # Main UI with Ant Design style
├── dist/                            # Compiled JavaScript (after build)
├── node_modules/                    # Dependencies
├── package.json                     # Project configuration
├── tsconfig.json                    # TypeScript configuration
└── README.md                        # This file
```

### Key Files Explained

| File | Purpose |
|------|---------|
| `app.ts` | Express server setup, middleware configuration |
| `mongodb.service.ts` | Singleton service for MongoDB connection |
| `homeController.ts` | Handles HTTP requests for CRUD operations |
| `User.ts` | User data model and database operations |
| `index.ts` (routes) | Defines API endpoints and maps to controllers |
| `search.tool.ts` | Parses query params and builds MongoDB queries |
| `index.ejs` | Frontend UI with table, search, pagination |

## 💡 Search Tool Usage Example

### In code:
```typescript
import { handleSearch } from './utils/search.tool';

// Query params from request
const queryParams = {
  'search[name:contains]': 'John',
  'search[email:endsWith]': '@gmail.com',
  'sort[createdAt]': 'desc',
  'page': '1',
  'limit': '10'
};

// Process search
const { filterQuery, sortQuery } = handleSearch(queryParams);

// Use with MongoDB
const users = await collection
  .find(filterQuery)
  .sort(sortQuery)
  .skip((page - 1) * limit)
  .limit(limit)
  .toArray();
```

## 🔥 Search Tool Highlights

1. **Multiple operators**: Supports 20+ different operators
2. **Type-safe**: Automatically converts ObjectId for _id fields
3. **Date handling**: Automatically detects and converts date strings
4. **Flexible**: Can search any field in the collection
5. **Performance**: Optimized MongoDB queries

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Run development server with nodemon (auto-reload) |
| `npm run dev:simple` | Run development server with ts-node (no auto-reload) |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run production server (requires build first) |

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Make sure MongoDB is running:
```bash
# Start MongoDB
mongod

# Or use MongoDB service
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Linux
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution:** Change the port or kill the process using port 3000:
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=8080 npm run dev
```

### TypeScript Compilation Errors
```bash
# Clean build and reinstall
rm -rf dist node_modules
npm install
npm run build
```

## ✅ Features Demo

### Search Functionality
- **Search by Name**: Type a name in the search box and click "Tìm kiếm"
- **Search by Email**: Filter users by email domain (e.g., @gmail.com)
- **Combined Search**: Search by both name and email simultaneously
- **Real-time Results**: Results update with pagination automatically

### CRUD Operations
- **Create**: Click "Thêm mới" button to add new user
- **Update**: Click "Sửa" button on any row to edit user details
- **Delete**: Click "Xóa" button with confirmation prompt
- **Read**: View all users with pagination

### Table Features
- **Sorting**: Click on column headers (Name, Email, Created Date) to sort
- **Pagination**: Navigate through pages with prev/next buttons
- **Responsive**: Works on mobile, tablet, and desktop
- **Ant Design Style**: Clean, professional UI

## 🎓 Learning Resources

This project demonstrates:
- **MVC Architecture**: Separation of concerns with Models, Views, Controllers
- **TypeScript**: Type-safe JavaScript development
- **MongoDB**: NoSQL database integration with advanced queries
- **EJS**: Server-side templating with dynamic data
- **Express**: RESTful API design with Node.js
- **Custom Search Tool**: Flexible query builder supporting 20+ operators
- **UI/UX**: Ant Design inspired interface

## 📞 Support

If you encounter any issues, please create an issue or contact the developer.

---

Made with ❤️ using Express TypeScript MVC
