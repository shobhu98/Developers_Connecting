const express=require('express');
const router=express.Router();
const {check,validationResult}=require('express-validator');
const auth=require('../../middleware/auth');
const Post=require('../../models/Posts');
const Profile=require('../../models/Profile');
const User=require('../../models/Users');
// @route  POST api/posts
// @desc   Create a post
// @access Private
router.post('/',[auth,
check('text','Text is required').not().isEmpty(),
],async function (req,res) {
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    } try {
        const user=await User.findById(req.user.id).select('-password');

        const newPost=new Post({
            text:req.body.text,
            name:user.name,
            avatar:user.avatar,
            user:req.user.id
        });
        const post=await newPost.save();
        res.json(post);
    }catch (err) {
        console.log(err.message);
        res.status(500).send('Sever Error');
    }


});
// @route  GET api/posts
// @desc   GET all posts
// @access  Private

router.get('/',auth,async function (req,res) {
    try {
        const posts= await Post.find().sort({date:-1});
        res.json(posts);
    }catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

});

// @route  GET api/posts/:id
// @desc   GET post by id
// @access  Private

router.get('/:id',auth,async function (req,res) {
    try {
        const posts= await Post.findById(req.params.id);
        if(!posts){
            return res.status(404).json({msg:'Post Not found'});
        }
        res.json(posts);
    }catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

});


// @route  DELETE api/posts/:id
// @desc   DELETE post by id
// @access  Private

router.delete('/:id',auth,async function (req,res) {
    try {
        const posts= await Post.findById(req.params.id);
        if(posts.user.toString()!==req.user.id){
            return res.status(401).json({msg:'User not Authorized'})
        }
        await posts.remove();
        res.json({msg:'Post removed'});

    }catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

});






module.exports=router;