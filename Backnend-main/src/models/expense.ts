import mongoose, { Document, Schema } from 'mongoose'

export interface IExpense extends Document {
  itemName:    string
  amount:      number
  category:    string
  expenseType: 'shop' | 'owner'   // 👈 add
  notes?:      string
}

const expenseSchema = new Schema<IExpense>(
  {
    itemName:    { type: String, required: true, trim: true },
    amount:      { type: Number, required: true, min: 0 },
    category:    { type: String, required: true, trim: true },
    expenseType: {                                  // 👈 add
      type:    String,
      enum:    ['shop', 'owner'],
      default: 'shop',
    },
    notes: { type: String },
  },
  { timestamps: true }
)

const Expense = mongoose.model<IExpense>('Expense', expenseSchema)
export default Expense