const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT_DIR = path.join(__dirname, '..', 'frontend');
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');
const MENU_FILE = path.join(DATA_DIR, 'menu.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

app.use(cors());
app.use(express.json());
app.use(express.static(ROOT_DIR));

async function ensureDataFiles() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(USERS_FILE).catch(async () => {
      const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
      const defaultUsers = [
        {
          id: 'admin-1',
          firstname: 'Admin',
          lastname: 'User',
          email: 'admin@tiffin.com',
          mobile: '0000000000',
          passwordHash: adminPasswordHash,
          address: 'Head Office',
          dietary: 'None',
          role: 'admin',
          createdAt: new Date().toISOString()
        }
      ];
      await fs.writeFile(USERS_FILE, JSON.stringify(defaultUsers, null, 2), 'utf8');
    });

    const existingUsers = await readJson(USERS_FILE);
    if (!existingUsers.some(user => user.role === 'admin')) {
      const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
      existingUsers.unshift({
        id: 'admin-1',
        firstname: 'Admin',
        lastname: 'User',
        email: 'admin@tiffin.com',
        mobile: '0000000000',
        passwordHash: adminPasswordHash,
        address: 'Head Office',
        dietary: 'None',
        role: 'admin',
        createdAt: new Date().toISOString()
      });
      await writeJson(USERS_FILE, existingUsers);
    }

    await fs.access(CONTACTS_FILE).catch(() => fs.writeFile(CONTACTS_FILE, '[]', 'utf8'));
    await fs.access(MENU_FILE).catch(() => fs.writeFile(MENU_FILE, JSON.stringify([
      { id: 'm1', name: 'Standard Thali', description: '4 Roti, 2 Sabzi, Dal, Rice, Salad', price: 150, category: 'Lunch/Dinner', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' },
      { id: 'm2', name: 'Jain Special', description: 'No root vegetables, purely Sattvic', price: 180, category: 'Lunch/Dinner', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvw7Ev0iMnU3jGJS5wfbYQD5cuMb6Rp4Zvug&s' },
      { id: 'm3', name: 'Premium Thali', description: 'Standard Thali + Sweet + Farsan', price: 250, category: 'Lunch/Dinner', image: 'https://grazia.wwmindia.com/content/2017/aug/screen_shot_2017-08-07_at_1_36_01_pm_1502092451.png' },
      { id: 'm4', name: 'Breakfast Poha', description: 'Fresh Poha with sev and lemon', price: 60, category: 'Breakfast', image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' }
    ], null, 2), 'utf8'));
    await fs.access(ORDERS_FILE).catch(() => fs.writeFile(ORDERS_FILE, '[]', 'utf8'));
  } catch (error) {
    console.error('Unable to initialize data files:', error);
  }
}

async function readJson(filePath) {
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data || '[]');
}

async function writeJson(filePath, payload) {
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf8');
}

app.post('/api/signup', async (req, res) => {
  const { firstname, lastname, email, mobile, password, address, dietary } = req.body;

  if (!firstname || !lastname || !email || !mobile || !password || !address) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  try {
    const users = await readJson(USERS_FILE);
    const existingUser = users.find(user => user.email.toLowerCase() === email.toLowerCase());

    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      firstname,
      lastname,
      email: email.toLowerCase(),
      mobile,
      passwordHash,
      address,
      dietary: dietary || 'None',
      role: 'customer',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await writeJson(USERS_FILE, users);

    res.json({ success: true, message: 'Signup completed successfully.' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Server error during signup.' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  try {
    const users = await readJson(USERS_FILE);
    const user = users.find(item => item.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    res.json({
      success: true,
      message: 'Login successful.',
      user: {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        mobile: user.mobile,
        dietary: user.dietary,
        role: user.role || 'customer'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

app.post('/api/contact', async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !phone || !subject || !message) {
    return res.status(400).json({ success: false, message: 'All contact fields are required.' });
  }

  try {
    const contacts = await readJson(CONTACTS_FILE);
    contacts.push({
      id: Date.now().toString(),
      name,
      email,
      phone,
      subject,
      message,
      submittedAt: new Date().toISOString()
    });

    await writeJson(CONTACTS_FILE, contacts);
    res.json({ success: true, message: 'Contact message submitted successfully.' });
  } catch (error) {
    console.error('Contact error:', error);
    res.status(500).json({ success: false, message: 'Server error while submitting contact form.' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Menu Endpoint
app.get('/api/menu', async (req, res) => {
  try {
    const menu = await readJson(MENU_FILE);
    res.json({ success: true, menu });
  } catch (error) {
    console.error('Menu error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching menu.' });
  }
});

app.post('/api/menu', async (req, res) => {
  const { name, description, price, category, image } = req.body;

  if (!name || !description || !price || !category || !image) {
    return res.status(400).json({ success: false, message: 'All menu fields are required.' });
  }

  try {
    const menu = await readJson(MENU_FILE);
    const newItem = {
      id: 'm' + Date.now().toString().slice(-6),
      name,
      description,
      price: Number(price),
      category,
      image
    };
    menu.push(newItem);
    await writeJson(MENU_FILE, menu);
    res.json({ success: true, menu: newItem, message: 'Menu item added successfully.' });
  } catch (error) {
    console.error('Menu add error:', error);
    res.status(500).json({ success: false, message: 'Server error while adding menu item.' });
  }
});

// Create Order Endpoint
app.post('/api/orders', async (req, res) => {
  const { items, totalAmount, customerDetails, userId } = req.body;
  if (!items || !totalAmount || !customerDetails) {
    return res.status(400).json({ success: false, message: 'Missing order details.' });
  }

  try {
    const orders = await readJson(ORDERS_FILE);
    const resolvedUserId = userId || customerDetails.userId || null;
    const orderCustomerDetails = {
      ...customerDetails,
      userId: resolvedUserId
    };
    const newOrder = {
      id: 'ORD-' + Date.now().toString().slice(-6),
      userId: resolvedUserId,
      items,
      totalAmount,
      customerDetails: orderCustomerDetails,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    orders.push(newOrder);
    await writeJson(ORDERS_FILE, orders);
    res.json({ success: true, orderId: newOrder.id, message: 'Order created successfully. Pending payment.' });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ success: false, message: 'Server error while creating order.' });
  }
});

app.get('/api/orders', async (req, res) => {
  const { userId, email, admin } = req.query;

  try {
    const orders = await readJson(ORDERS_FILE);

    if (admin === 'true') {
      return res.json({ success: true, orders });
    }

    if (!userId && !email) {
      return res.status(400).json({ success: false, message: 'Missing userId or email query parameter.' });
    }

    const filteredOrders = orders.filter(order => {
      const matchesUserId = userId && (order.userId === userId || order.customerDetails?.userId === userId);
      const matchesEmail = email && order.customerDetails?.email && order.customerDetails.email.toLowerCase() === email.toLowerCase();
      return matchesUserId || matchesEmail;
    });

    res.json({ success: true, orders: filteredOrders });
  } catch (error) {
    console.error('Order list error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching orders.' });
  }
});

app.patch('/api/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: 'Missing status.' });
  }

  try {
    const orders = await readJson(ORDERS_FILE);
    const orderIndex = orders.findIndex(o => o.id.toUpperCase() === id.toUpperCase());

    if (orderIndex === -1) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    orders[orderIndex].status = status;
    orders[orderIndex].updatedAt = new Date().toISOString();

    if (status === 'Delivered') {
      orders[orderIndex].deliveredAt = new Date().toISOString();
    }

    await writeJson(ORDERS_FILE, orders);
    res.json({ success: true, order: orders[orderIndex], message: 'Order status updated.' });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating status.' });
  }
});

// Mock Payment Gateway Endpoint
app.post('/api/payment', async (req, res) => {
  const { orderId, paymentMethod } = req.body;
  if (!orderId || !paymentMethod) {
    return res.status(400).json({ success: false, message: 'Missing payment details.' });
  }

  try {
    const orders = await readJson(ORDERS_FILE);
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Simulate payment processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update order status
    orders[orderIndex].status = 'Preparing'; // After payment, start preparing
    orders[orderIndex].paymentMethod = paymentMethod;
    orders[orderIndex].paidAt = new Date().toISOString();

    await writeJson(ORDERS_FILE, orders);
    res.json({ success: true, message: 'Payment successful.', order: orders[orderIndex] });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ success: false, message: 'Server error while processing payment.' });
  }
});

// Track Order Endpoint
app.get('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const orders = await readJson(ORDERS_FILE);
    const order = orders.find(o => o.id.toUpperCase() === id.toUpperCase());
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching order status.' });
  }
});

ensureDataFiles().then(() => {
  app.listen(PORT, () => {
    console.log(`Tiffin Wallah backend running at http://localhost:${PORT}`);
  });
});
