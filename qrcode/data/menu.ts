import { MenuItem } from '../types';

export const menuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Filet Mignon',
    description: 'Tender beef filet grilled to perfection, served with roasted vegetables and red wine jus',
    price: 2432.00,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
    available: true
  },
  {
    id: '2',
    name: 'Lobster Bisque',
    description: 'Rich and creamy lobster soup with cognac and fresh herbs',
    price: 1024.00,
    category: 'Appetizer',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400',
    available: true
  },
  {
    id: '3',
    name: 'Evian Water',
    description: 'Premium natural mineral water from the French Alps',
    price: 320.00,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
    available: true
  },
  {
    id: '4',
    name: 'Grilled Salmon',
    description: 'Fresh Atlantic salmon with lemon butter and seasonal vegetables',
    price: 1890.00,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
    available: true
  },
  {
    id: '5',
    name: 'Caesar Salad',
    description: 'Crisp romaine lettuce with parmesan, croutons, and classic Caesar dressing',
    price: 680.00,
    category: 'Salad',
    image: 'https://images.unsplash.com/photo-1551248429-40975aa4de74?w=400',
    available: true
  },
  {
    id: '6',
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with molten center, served with vanilla ice cream',
    price: 520.00,
    category: 'Dessert',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400',
    available: true
  },
  {
    id: '7',
    name: 'House Wine',
    description: 'Selection of red or white wine from our house collection',
    price: 450.00,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1566754966463-c492ff305ac7?w=400',
    available: true
  },
  {
    id: '8',
    name: 'Truffle Risotto',
    description: 'Creamy arborio rice with black truffle and parmesan',
    price: 1650.00,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400',
    available: true
  }
];

export const restaurant = {
  id: '1',
  name: 'Fine Dining Restaurant',
  address: '123 Gourmet Street, Cairo, Egypt',
  phone: '+20 2 1234 5678',
  email: 'info@finedining.com',
  taxRate: 0.14, // 14%
  serviceChargeRate: 0.12 // 12%
};