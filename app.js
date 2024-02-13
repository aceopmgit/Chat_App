const express = require("express");
const bodyparser = require("body-parser");
const path = require("path");
const fs = require('fs');
require('dotenv').config();
const cors = require('cors');
const morgan = require('morgan');


const sequelize = require("./util/database");
const user = require("./models/user");
const fPassword = require('./models/forgotPassword');
const chats = require('./models/chats');
const group = require('./models/group');
const groupUser = require('./models/groupUser');


const app = express();
const server = require('http').createServer(app)

const io = require('socket.io')(server);
io.on('connection', socket => {
    // console.log(`*********************${socket.id}***************************`);
    socket.on('send-message', (message) => {
        // console.log(message);
        socket.broadcast.emit('receive-message', message);
    })
})

const userRoutes = require("./routes/user");
const chatRoutes = require('./routes/chatRoom')
const passwordRoutes = require("./routes/password");
const groupRoutes = require('./routes/groups');
const adminRoutes = require('./routes/admin');
const indexRoutes = require("./routes/index");
const errorRoutes = require('./routes/error404');


const accessLogStream = fs.createWriteStream(path.join(__dirname, 'logs', 'access.log'), { flags: 'a' });


app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));
app.use(morgan('combined', { stream: accessLogStream }));
const PORT = process.env.PORT || 4000;

app.use(cors({
    origin: '*',

}))
app.use('/check', () => { console.log('****************************************************') });
app.use("/user", userRoutes);
app.use("/chatRoom", chatRoutes);
app.use("/password", passwordRoutes);
app.use('/group', groupRoutes);
app.use('/admin', adminRoutes);
app.use(indexRoutes);
app.use(errorRoutes);

user.hasMany(fPassword);
fPassword.belongsTo(user, { constraints: true, onDelete: 'CASCADE' });

user.hasMany(chats);
chats.belongsTo(user, { constraints: true, onDelete: 'CASCADE' });

group.hasMany(chats);
chats.belongsTo(group, { constraints: true, onDelete: 'CASCADE' });

user.belongsToMany(group, { through: groupUser });
group.belongsToMany(user, { through: groupUser })


sequelize
    .sync()
    //.sync({ force: true }) //it syncs our models to the database by creating the appropriate tables and relations if we have them
    .then((result) => {
        server.listen(PORT, () => { console.log(`*************This is running on Port ${PORT}***********************`) });
    })
    .catch((err) => {
        console.log(err);
    });

