const  express=require('express');
const app=express();
const PORT=process.env.PORT||5000;
const connectDB=require('./config/db');

connectDB();

//Init middleware
app.use(express.json({extended:false}));

app.use('/api/users',require('./routes/api/users'));
app.use('/api/auth',require('./routes/api/auth'));
app.use('/api/profile',require('./routes/api/profile'));
app.use('/api/posts',require('./routes/api/posts'));
app.listen(PORT,function () {

    console.log("running on port "+PORT);
});
