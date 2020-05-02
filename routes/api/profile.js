const express=require('express');
const router=express.Router();
const auth=require('../../middleware/auth');
const Profile=require('../../models/Profile');
const User=require('../../models/Users');
const Post=require('../../models/Posts');
const {check,validationResult}=require('express-validator');

// @route GET api/profile/me
// @desc   Get profile by user ID
// @access Public
router.get('/me',auth,async function (req,res) {

    try {
        const profile=await Profile.findOne({user:req.user.id}).populate('user',['name',
        'avatar']);
        if(!profile){
            return res.status(400).json({msg:'There is no profile for this user'});
        }
        res.json(profile);
    }catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

});

// @route POST api/profile/
// @desc   Get current users profile
// @access Private

router.post('/',[
    auth,
    check('status','Status is required')
        .not()
        .isEmpty(),
    check('skills','Skills is required')
        .not()
        .isEmpty()
],async function (req,res) {
const errors=validationResult(req);
if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.array()});
}
const {
    company,
    website,
    location,
    bio,
    status,
    githubusername,
    skills,
    youtube,
    facebook,
    twitter,
    instagram,
    linkedin
}=req.body;

    //Build profile object
    const profileFields={};
profileFields.user=req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (status) profileFields.status = status;
    if (bio) profileFields.bio = bio;
    if (githubusername) profileFields.githubusername =githubusername;
    if(skills){
        profileFields.skills=skills.split(',').map(skill=>skill.trim());
    }
    //Build social object
    profileFields.social={};
    if(youtube) profileFields.social.youtube=youtube;
    if(twitter) profileFields.social.twitter=twitter;
    if(facebook) profileFields.social.facebook=facebook;
    if(linkedin) profileFields.social.linkedin=linkedin;
    if(instagram) profileFields.social.instagram=instagram;

    console.log(profileFields.social.twitter);





    try {
        let profile=Profile.findOne({user:req.user.id});
        if(profile){
            //Update
            profile=await Profile.findOneAndUpdate({user:req.user.id},
                {$set:profileFields},
                {new:true})
        }
        // Create
        profile=new Profile(profileFields);
        await profile.save();
        res.json(profile);
    }catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }

});

//@route GET api/profile
// @ desc  GET all profiles
// @accesss Public

router.get('/',async (req,res)=>{
   try {
       const profiles=await Profile.find().populate('user',['name','avatar']);
       res.json(profiles);

   } catch (err) {
       console.error(err.message);
       res.status(500).send('Server Error')
   }
});




// @route GET api/profile/
// @desc   Get profile by user ID
// @access Public

router.get('/user/:user_id',async function (req,res) {
    try {
        const profile=await Profile.findOne({user:req.params.user_id}).populate('user',['name','avatar']);
        if(!profile){
            return res.status(400).json({msg:'There is no profile for this user'})
        }

        res.json(profile);

    }catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }

});

// @route DELETE api/profile
// @desc Delete profile,user & posts
// @access Private

router.delete('/',auth,async function (req,res) {
   try {
       // @todo -remove users posts
       await Post.deleteMany({user:req.user.id});

       //Remove profile
       await Profile.findOneAndRemove({user:req.user.id});
       //Remove user
       await User.findOneAndRemove({_id:req.user.id});

       res.json({msg:'User deleted'})
   }catch (err) {
       console.error(err.message);
       res.status(500).send('Server Error');
   }

});


// @route PUT api/profile/experience
// @desc   Add profile experience
// @access Private
router.put('/experience',[auth,[
    check('title','Title is required').not().isEmpty(),
    check('company','Company is required').not().isEmpty(),
    check('from','From date is required').not().isEmpty(),
]],async function (req,res) {
const errors=validationResult(req);
if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.array()});
}
const {
    title,
    company,
    location,
    from,
    to,
    current,
    description
}=req.body;
const newExp={
    title,
    company,
    location,
    from,
    to,
    current,
    description
};
try {
    const profile=await Profile.findOne({user:req.user.id});
    profile.experience.unshift(newExp);
    await profile.save();
    res.json(profile);
}catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');

}
});
// @route DELETE api/profile/experience/:exp_id
// @desc   Delete experience
// @access Private
router.delete('/experience/:exp_id',auth,async function (req,res) {
    try {
        const profile=await Profile.findOne({user:req.user.id});

        //Get remove Index
        // To understand this
        const removeIndex=profile.experience.map(item=>item.id).indexOf(req.params.exp_id);

        profile.experience.splice(removeIndex,1);
        await profile.save();
        res.json(profile);

    }catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');

    }

});

// @route PUT api/profile/education
// @desc   Add education experience
// @access Private
router.put('/education',[auth,[
    check('school','School is required').not().isEmpty(),
    check('degree','Degree is required').not().isEmpty(),
    check('fieldofstudy','Field of study is required').not().isEmpty(),
    check('from','From date is required').not().isEmpty(),
]],async function (req,res) {
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }=req.body;
    const newEdu={
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    };
    try {
        const profile=await Profile.findOne({user:req.user.id});
        profile.education.unshift(newEdu);
        await profile.save();
        res.json(profile);
    }catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');

    }
});


// @route DELETE api/profile/education/:exp_id
// @desc   Delete education from profile
// @access Private
router.delete('/education/:edu_id',auth,async function (req,res) {
    try {
        const profile=await Profile.findOne({user:req.user.id});

        //Get remove Index
        // To understand this
        const removeIndex=profile.education.map(item=>item.id).indexOf(req.params.edu_id);

        profile.education.splice(removeIndex,1);
        await profile.save();
        res.json(profile);
    }catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');

    }

});










module.exports=router;
