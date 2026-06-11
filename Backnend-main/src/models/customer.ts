import mongoose,{Document,Schema} from "mongoose";

export interface ICustomer extends Document {
  name:  string
  phone: string
}

const customerSchema = new Schema<ICustomer>(
  {
    name:  { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
)

const Customer = mongoose.model<ICustomer>('Customer', customerSchema)

export default Customer