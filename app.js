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
const group = require('./models/group')
const groupUser = require('./models/groupUser');

const app = express();

const userRoutes = require("./routes/user");
const chatRoutes = require('./routes/chatRoom')
const passwordRoutes = require("./routes/password");
const groupRoutes = require('./routes/groups');
const indexRoutes = require("./routes/index");
const errorRoutes = require('./routes/error404');


const accessLogStream = fs.createWriteStream(path.join(__dirname, 'logs', 'access.log'), { flags: 'a' });


app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));
app.use(morgan('combined', { stream: accessLogStream }));

app.use(cors({
    origin: '*',

}))

app.use("/user", userRoutes);
app.use("/chatRoom", chatRoutes);
app.use("/password", passwordRoutes);
app.use('/group', groupRoutes);
app.use(indexRoutes);
app.use(errorRoutes);

user.hasMany(fPassword);
fPassword.belongsTo(user);

user.hasMany(chats);
chats.belongsTo(user);

group.hasMany(chats);
chats.belongsTo(group);

user.belongsToMany(group, { through: groupUser });
group.belongsToMany(user, { through: groupUser })


sequelize
    .sync()
    //.sync({ force: true }) //it syncs our models to the database by creating the appropriate tables and relations if we have them
    .then((result) => {
        app.listen(process.env.PORT || 4000);
    })
    .catch((err) => {
        console.log(err);
    });

