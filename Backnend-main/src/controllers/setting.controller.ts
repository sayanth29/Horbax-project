import { Request, Response } from 'express'
import Settings, { ISettings } from '../models/settings.js'

const defaultSettings = {
  washTypes: [
    { name: 'Steam Wash',   price: 80  },
    { name: 'Heavy Wash',   price: 120 },
    { name: 'Dry Clean',    price: 200 },
    { name: 'Quick Wash',   price: 60  },
    { name: 'Ironing Only', price: 30  },
  ],
  clothTypes: [
    { name: 'Shirt',    price: 30  },
    { name: 'Pant',     price: 40  },
    { name: 'Saree',    price: 60  },
    { name: 'Salwar',   price: 50  },
    { name: 'Jeans',    price: 40  },
    { name: 'Bedsheet', price: 80  },
    { name: 'Towel',    price: 20  },
    { name: 'Jacket',   price: 100 },
    { name: 'Kurta',    price: 45  },
  ],
}

const getOrCreateSettings = async (): Promise<ISettings> => {
  let settings = await Settings.findOne()
  if (!settings) {
    settings = await Settings.create(defaultSettings)
  }
  return settings
}

// GET /api/settings
export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const settings = await getOrCreateSettings()
    res.json(settings)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

// POST /api/settings/wash
export const addWashType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, price } = req.body


    
    if (!name || price === undefined) {
      res.status(400).json({ message: 'Name and price are required' })
      return
    }
    const settings = await getOrCreateSettings()
    settings.washTypes.push({ name, price })
    await settings.save()
    res.json(settings)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

// PATCH /api/settings/wash/:index
export const updateWashType = async (req: Request, res: Response): Promise<void> => {
  try {
    const index = parseInt(req.params.index as string)
    if (isNaN(index)) {
      res.status(400).json({ message: 'Invalid index' })
      return
    }
    const { name, price } = req.body
    const settings = await getOrCreateSettings()
    if (index < 0 || index >= settings.washTypes.length) {
      res.status(400).json({ message: 'Invalid index' })
      return
    }
    if (name  !== undefined) settings.washTypes[index].name  = name
    if (price !== undefined) settings.washTypes[index].price = price
    await settings.save()
    res.json(settings)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

// DELETE /api/settings/wash/:index
export const deleteWashType = async (req: Request, res: Response): Promise<void> => {
  try {
    const index = parseInt(req.params.index as string)
    if (isNaN(index)) {
      res.status(400).json({ message: 'Invalid index' })
      return
    }
    const settings = await getOrCreateSettings()
    if (index < 0 || index >= settings.washTypes.length) {
      res.status(400).json({ message: 'Invalid index' })
      return
    }
    settings.washTypes.splice(index, 1)
    await settings.save()
    res.json(settings)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

// POST /api/settings/cloth
export const addClothType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, price } = req.body
    if (!name || price === undefined) {
      res.status(400).json({ message: 'Name and price are required' })
      return
    }
    const settings = await getOrCreateSettings()
    const exists = settings.clothTypes.find(
      (c: { name: string }) => c.name.toLowerCase() === name.toLowerCase()
    )
    if (exists) {
      res.status(400).json({ message: 'Cloth type already exists' })
      return
    }
    settings.clothTypes.push({ name, price })
    await settings.save()
    res.json(settings)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

// PATCH /api/settings/cloth/:index
export const updateClothType = async (req: Request, res: Response): Promise<void> => {
  try {
    const index = parseInt(req.params.index as string)
    if (isNaN(index)) {
      res.status(400).json({ message: 'Invalid index' })
      return
    }
    const { name, price } = req.body
    const settings = await getOrCreateSettings()
    if (index < 0 || index >= settings.clothTypes.length) {
      res.status(400).json({ message: 'Invalid index' })
      return
    }
    if (name  !== undefined) settings.clothTypes[index].name  = name
    if (price !== undefined) settings.clothTypes[index].price = price
    await settings.save()
    res.json(settings)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

// DELETE /api/settings/cloth/:index
export const deleteClothType = async (req: Request, res: Response): Promise<void> => {
  try {
    const index = parseInt(req.params.index as string)
    if (isNaN(index)) {
      res.status(400).json({ message: 'Invalid index' })
      return
    }
    const settings = await getOrCreateSettings()
    if (index < 0 || index >= settings.clothTypes.length) {
      res.status(400).json({ message: 'Invalid index' })
      return
    }
    settings.clothTypes.splice(index, 1)
    await settings.save()
    res.json(settings)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}