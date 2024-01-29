const express = require("express");
const bodyparser = require("body-parser");
const path = require("path");
require('dotenv').config();
const cors = require('cors');

const sequelize = require("./util/database");
const user = require("./models/user");
const fPassword = require('./models/forgotPassword');
const chats = require('./models/chats');

const app = express();

const userRoutes = require("./routes/user");
const chatRoutes = require('./routes/chatRoom')
const passwordRoutes = require("./routes/password");
const indexRoutes = require("./routes/index");
const errorRoutes = require('./routes/error404');

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));
app.use(cors({
    origin: '*',

}))

app.use("/ChatterBox/user", userRoutes);
app.use("/ChatterBox/chatRoom", chatRoutes);
app.use("/ChatterBox/password", passwordRoutes);
app.use("/ChatterBox", indexRoutes);
app.use(errorRoutes);

user.hasMany(fPassword);
fPassword.belongsTo(user);

user.hasMany(chats);
chats.belongsTo(user);


sequelize
    .sync()
    //.sync({ force: true }) //it syncs our models to the database by creating the appropriate tables and relations if we have them
    .then((result) => {
        app.listen(process.env.PORT || 4000);
    })
    .catch((err) => {
        console.log(err);
    });

