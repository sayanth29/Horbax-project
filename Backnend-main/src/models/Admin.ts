import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'

// 1️⃣ INTERFACE
export interface IAdmin extends Document {
  username: string
  password: string
  matchPassword(enteredPassword: string): Promise<boolean>
}

// 2️⃣ SCHEMA
const adminSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
)

// 3️⃣ MIDDLEWARE
adminSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password as string, 10)
})

// 4️⃣ METHOD
adminSchema.methods.matchPassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password)
}

// 5️⃣ MODEL
const Admin = mongoose.model<IAdmin>('Admin', adminSchema)

export default Admin;