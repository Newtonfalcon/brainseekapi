import mongoose, {Schema, model} from "mongoose"

const chatSchema = new Schema({
      title:{
            type:String,
            default:"New Chat",
      },
      userId:{
            type:mongoose.Types.ObjectId,
            ref:"User",
            
      },
     
}, {timestamps:true})

const Chat = model("Chat", chatSchema);   

export default Chat;