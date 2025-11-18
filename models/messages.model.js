import mongoose from "mongoose";
import {Schema, model} from "mongoose";

const messageSchema = new Schema({
      chatId:{
            type:mongoose.Types.ObjectId,
            ref:"Chat",
            required:true,
          
      },
      /*role:{
            enum:["user","assistant","system"],
            type:String,
            required:true,
      },
      content:{
            type:String,
            required:true,
      },*/

      messages:[
            {
                  role:{
                        type:String,
                  },
                  content:{
                        type:String,
                  }
            }
      ],
      thread_id:{
            type:String
      }
}, {timestamps:true})

const Message = model("Message", messageSchema);

export default Message;