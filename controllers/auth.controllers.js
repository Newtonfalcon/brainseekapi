import { setToken } from "../libs/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const register = async(req, res)=>{
      const {name, email, password} = req.body;
      try {
            if(!name || !email || !password){
                  return res.status(400).json({error: "All fields are required"});
            }

            const existingUser = await User.findOne({email});
            if(existingUser){
                  return res.status(400).json({error: "User already exists"});
            }
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const newUser = new User({name, email, password: hashedPassword});
            setToken(newUser._id, res);
            await newUser.save();
            res.status(201).json({name: newUser.name, email: newUser.email, id: newUser._id});
      } catch (error) {
            res.status(500).json({error: error.message});
      }
}

export const login = async (req, res) => {
      const {email, password} = req.body

      try {
            
     
      
            if(!email || !password){
                  return res.status(400).json({message: "All fields required"})
            }

            const user = await User.findOne({email})
            if(!user){
                  return res.status(400).json({message:"incorrect credentials"})
            }

            const comparePassword =await bcrypt.compare(password, user.password)
            if(!comparePassword){
                  return res.status(400).json({message: "incorrect credentials"})
            }
            if(comparePassword){
            setToken(user._id, res)
            return res.status(200).json({
                  message:`welcome back ${user.name}`,
                  name: user.name,
                  email:user.email,
                  id: user._id
            })
            

      }

      } catch (error) {
            
            return res.status(500).json(error.message)
      }
      
}

export const logout = (req, res) => {
      res.cookie("token", "", {
            httpOnly: true,
            expires: new Date(0),
      });
      res.status(200).json({message: "Logged out successfully"});
}

export const getUser = async (req, res) => {
      
      res.json({
           id:req.user._id,
           email:req.user.email,
           name:req.user.name

      })
}