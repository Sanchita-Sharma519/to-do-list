const mongoose=require("mongoose")
const bcrypt=require('bcrypt')

const userSchema = new mongoose.Schema({
    name:{
      type: String,
    },
    email: {
      type: String,
      //required: true
    },
    password: {
        type: String,
      //required: true
    },
    confirmPassword: {
      type: String,
    //required: true
    },
    list: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'List' }]
  });
  userSchema.method({
    async authenticate(password) {
       return bcrypt.compare(password, this.password);
    },
  });
  const User = mongoose.model('User', userSchema);

  module.exports=User;