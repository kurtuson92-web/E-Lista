const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;

//server database
mongoose.connect('mongodb+srv://kurtuson92_db_user:Coleenderella%40112602@cluster0.q3cyz3t.mongodb.net/CupitateDB')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

  //schema for file creation to database
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  credits: [
    {
      amount: { type: Number, required: true },
      source: { type: String, required: true },
      date: { type: Date, default: Date.now }
    }
  ]
});

//data collection path
const User = mongoose.model('User', userSchema, 'users');

//path for the web landing (htmlfiles)
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => res.redirect('/home'));
app.get('/home', (req, res) => res.sendFile(path.join(__dirname, 'home.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'dashboard.html')));

//signup
app.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // checking existed email in database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    // new user
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashed, credits: [] });
    await user.save();

    console.log('New user:', email, username);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// for login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.json({ exists: false });

    //check if email already exist during login
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.json({ exists: false });

    res.json({ exists: true, username: user.username });
  } catch (err) {
    console.error(err);
    res.json({ exists: false });
  }
});

// get credit data to database
app.post('/get-credit', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.json({ total: 0, credits: [] });
    const total = user.credits.reduce((sum, c) => sum + c.amount, 0);
    res.json({ total, credits: user.credits });
  } catch (err) {
    console.error(err);
    res.json({ total: 0, credits: [] });
  }
});

// add credit function (button in html connected with js front)
app.post('/add-credit', async (req, res) => {
  try {
    const { email, amount, source } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send('User not found');
    user.credits.push({ amount: parseFloat(amount), source, date: new Date() });
    await user.save();
    const total = user.credits.reduce((sum, c) => sum + c.amount, 0);
    res.json({ success: true, total, credits: user.credits });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// reduce credit function(button in html connected with js front)
app.post('/reduce-credit', async (req, res) => {
  try {
    const { email, amount, source } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send('User not found');
    user.credits.push({ amount: -parseFloat(amount), source, date: new Date() });
    await user.save();
    const total = user.credits.reduce((sum, c) => sum + c.amount, 0);
    res.json({ success: true, total, credits: user.credits });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// change name inside account (logged in)
app.post("/update-username", async (req, res) => {
  try {
    const { email, newUsername } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false });

    user.username = newUsername;
    await user.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// change pass inside account (logged in)
app.post("/change-password", async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ success: false, message: "Current password incorrect." });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// forgot pass for main page
app.post("/forgot-password", async (req, res) => {
  try {
    const { email, username, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (user.username !== username) {
      return res.status(400).json({ success: false, message: "Username does not match." });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

//server the host 3000 will be used
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
