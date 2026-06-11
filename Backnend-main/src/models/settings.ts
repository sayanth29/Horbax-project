import mongoose, { Document, Schema } from 'mongoose'

// Wash type shape
export interface IWashType {
  name:  string
  price: number
}

// Cloth type shape — now has price too
export interface IClothType {
  name:  string
  price: number
}

// Full settings shape
export interface ISettings extends Document {
  washTypes:  IWashType[]
  clothTypes: IClothType[]
}

// Wash type sub-schema
const washTypeSchema = new Schema<IWashType>({
  name:  { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
})

// Cloth type sub-schema — updated with price
const clothTypeSchema = new Schema<IClothType>({
  name:  { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
})

// Main settings schema
const settingsSchema = new Schema<ISettings>(
  {
    washTypes:  [washTypeSchema],
    clothTypes: [clothTypeSchema],
  },
  { timestamps: true }
)

const Settings = mongoose.model<ISettings>('Settings', settingsSchema)

export default Settings