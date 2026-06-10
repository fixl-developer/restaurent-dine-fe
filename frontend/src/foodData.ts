import cakeImg from './assets/images/cake.jpg';
import eggNoodlesImg from './assets/images/eggnoodles.jpg';
import eggSaladImg from './assets/images/eggsalad.jpg';
import noodlesImg from './assets/images/noodles.jpg';
import oatsImg from './assets/images/oats.jpg';
import oats2Img from './assets/images/oats2.jpg';
import saladImg from './assets/images/salad.jpg';
import sauceImg from './assets/images/sauce.jpg';

import decorImg  from './assets/images/decor.jpg';
import decor2Img from './assets/images/decor2.jpg';
import decor3Img from './assets/images/decor3.jpg';
import decor4Img from './assets/images/decor4.jpg';
import decor5Img from './assets/images/decor5.jpg';

import { MenuItem } from './types';

// ── Beverage images: glob-imported to handle special-character filenames ──────
const _imgs = import.meta.glob<{ default: string }>('./assets/images/*.{jpg,jpeg,png}', { eager: true });
const _get  = (partial: string): string => {
  const key = Object.keys(_imgs).find(k => k.toLowerCase().includes(partial.toLowerCase()));
  return key ? _imgs[key].default : cakeImg;
};

const sakuraMatchaImg    = _get('sakura matcha');
const frappuccinoImg     = _get('frappuccino');
const blueberrySlushImg  = _get('blueberry slush');
const strawberryLatteImg = _get('strawberry latte');
const mangoFrappeImg     = _get('mango');

// ── Exports ───────────────────────────────────────────────────────────────────

export const DECOR_IMAGES = {
  decor1: decorImg,
  decor2: decor2Img,
  decor3: decor3Img,
  decor4: decor4Img,
  decor5: decor5Img,
  cottagecorePlate: decor2Img,
  berriesDecor:     decor3Img,
  foodPfp:          decor4Img,
  creditImage:      decor5Img,
  burgundyPlate:    sauceImg,
  download16_1:     decorImg,
};

export const FOOD_IMAGES = {
  cake:        cakeImg,
  eggnoodles:  eggNoodlesImg,
  eggsalad:    eggSaladImg,
  noodles:     noodlesImg,
  oats:        oatsImg,
  oats2:       oats2Img,
  salad:       saladImg,
  sauce:       sauceImg,
  // Beverages
  sakuraMatcha:    sakuraMatchaImg,
  frappuccino:     frappuccinoImg,
  blueberrySlush:  blueberrySlushImg,
  strawberryLatte: strawberryLatteImg,
  mangoFrappe:     mangoFrappeImg,
};

export const MENU_ITEMS: MenuItem[] = [
  // ── Sweets ──────────────────────────────────────────────────────────────────
  {
    id: 'm1',
    name: 'Strawberry Icing Velvet Cake',
    price: 6.80,
    category: 'sweets',
    description: 'A beautiful single-slice sponge cake dressed in fluffy pastel strawberry whipped icing & rainbow confetti.',
    image: cakeImg,
    calories: 420,
    badge: 'HOUSE FARE',
  },
  {
    id: 'm11',
    name: 'Double Matcha Crème Mille Crêpe',
    price: 7.90,
    category: 'sweets',
    description: 'Twenty paper-thin crêpe layers layered with organic Uji matcha white chocolate custard cream.',
    image: decor2Img,
    calories: 380,
    badge: 'NEW ARRIVAL',
  },
  {
    id: 'm15',
    name: 'Coquette Berry Whipped Princess Cake',
    price: 8.20,
    category: 'sweets',
    description: 'Double chiffon layers filled with vanilla custard, glazed peaches, and high-purity strawberries.',
    image: cakeImg,
    calories: 450,
    badge: 'HOUSE SPECIAL',
  },
  {
    id: 'm2',
    name: 'Golden Peach Morning Oat Bowl',
    price: 8.50,
    category: 'sweets',
    description: 'Nourishing organic oats cooked in almond milk, layered with fresh peach slices & sweet local honey.',
    image: oats2Img,
    calories: 310,
    badge: 'SWEET START',
  },
  {
    id: 'm3',
    name: 'Classic Berry Chia Oats Porridge',
    price: 7.50,
    category: 'sweets',
    description: 'Thick creamy oats porridge cooked with organic chia seeds, topped with strawberries & forest blueberries.',
    image: oatsImg,
    calories: 280,
    badge: 'HEALTHY DELIGHT',
  },
  // ── Mains ───────────────────────────────────────────────────────────────────
  {
    id: 'm4',
    name: 'Garden Fresh Tossed Salad',
    price: 9.50,
    category: 'mains',
    description: 'Crisp green leaf base, tender baby herbs, cucumber reels, and a light splash of peach vinaigrette dressing.',
    image: saladImg,
    calories: 190,
    badge: 'RAW ORGANIC',
  },
  {
    id: 'm13',
    name: 'Sesame Glazed Braised Pork Rice',
    price: 13.90,
    category: 'mains',
    description: 'Melt-in-your-mouth slow braised pork shoulder over fluffy white sushi rice with pickled cucumbers & sesame drizzle.',
    image: sauceImg,
    calories: 580,
    badge: 'HOUSE SECRETS',
  },
  {
    id: 'm5',
    name: 'Sichuan Sesame Chili Noodles',
    price: 11.50,
    category: 'mains',
    description: 'Cozy wheat noodles tossed in roasted sesame oil, sweet soy broth, minced scallions & signature chili paste.',
    image: noodlesImg,
    calories: 490,
    badge: 'COZY SPICE',
  },
  {
    id: 'm16',
    name: 'Saucier Garlic Soft Noodles',
    price: 11.90,
    category: 'mains',
    description: 'Warm handmade wheat strands tossed in black vinegar garlic soy, roasted sesame, and spring sprouts.',
    image: noodlesImg,
    calories: 430,
    badge: 'GARDEN FRESH',
  },
  {
    id: 'm6',
    name: 'Wok-fired Handmade Egg Noodles',
    price: 12.00,
    category: 'mains',
    description: 'Broad golden egg noodles tossed in dynamic garlic soy, fresh mixed spring greens, and light white pepper broth.',
    image: eggNoodlesImg,
    calories: 520,
    badge: 'CHEF TRADITIONAL',
  },
  // ── Sides ────────────────────────────────────────────────────────────────────
  {
    id: 's1',
    name: 'Creamy Potato & Egg Salad Plate',
    price: 4.80,
    category: 'sides',
    description: 'Premium light mustard egg salad mashed with cold diced green potatoes, served in a double-walled bowl.',
    image: eggSaladImg,
    calories: 260,
    badge: 'SAVORY DELICACY',
  },
  {
    id: 's17',
    name: 'Diner Golden Egg Potato Croquettes',
    price: 5.20,
    category: 'sides',
    description: 'Crispy fried panko outer layer filled with soft mashed potatoes and fresh sweet herbs.',
    image: eggSaladImg,
    calories: 240,
    badge: 'HOT SIDE',
  },
  {
    id: 's2',
    name: 'Signature Chili Soy Dipping Sauce',
    price: 1.50,
    category: 'sides',
    description: 'A custom savory dipping cup made of crushed chili flakes, slow-cooked sesame stock & dark oil glaze.',
    image: sauceImg,
    calories: 70,
    badge: 'FLAVOR BOOSTER',
  },
  // ── Beverages ────────────────────────────────────────────────────────────────
  {
    id: 'bev1',
    name: 'Sakura Matcha Latte',
    price: 6.50,
    category: 'drinks',
    description: 'Ceremonial-grade matcha with a delicate sakura floral note, topped with velvety cold oat milk foam and a cherry blossom garnish.',
    image: sakuraMatchaImg,
    calories: 145,
    badge: 'JAPANESE BLEND',
  },
  {
    id: 'bev2',
    name: 'Classic House Frappuccino',
    price: 7.00,
    category: 'drinks',
    description: 'Blended espresso with premium cream, chocolate drizzle, and a light vanilla cold foam crown — rich and satisfying.',
    image: frappuccinoImg,
    calories: 290,
    badge: 'CAFÉ SIGNATURE',
  },
  {
    id: 'bev3',
    name: 'Blueberry Cloud Slush',
    price: 5.80,
    category: 'drinks',
    description: 'Crushed blueberry slush with sparkling mineral water, elderflower syrup, and fresh mint for a refreshing finish.',
    image: blueberrySlushImg,
    calories: 130,
    badge: 'ICED COLD',
  },
  {
    id: 'bev4',
    name: 'Luna Strawberry Milk Latte',
    price: 6.20,
    category: 'drinks',
    description: 'Velvety strawberry-infused oat milk with cold brew espresso and a dusting of freeze-dried berry powder.',
    image: strawberryLatteImg,
    calories: 180,
    badge: 'FAN FAVOURITE',
  },
  {
    id: 'bev5',
    name: 'Tropical Mango Frappe',
    price: 6.50,
    category: 'drinks',
    description: 'Ripe Alphonso mango blended with coconut milk, a hint of chilli salt, and sweet passionfruit foam on top.',
    image: mangoFrappeImg,
    calories: 240,
    badge: 'SUMMER HIT',
  },
  {
    id: 'd1',
    name: 'Peach Garden Strawberry Matcha Latte',
    price: 5.50,
    category: 'drinks',
    description: 'Ceremonial stone-ground green tea over a base of fresh organic strawberry pink milk foam.',
    image: strawberryLatteImg,
    calories: 160,
    badge: 'BESTSELLER',
  },
  {
    id: 'd2',
    name: 'Peach Oatmeal Cream Smoothie',
    price: 5.00,
    category: 'drinks',
    description: 'Rich blended cream shake with organic peach juice base, oatmeal milk froth and a sweet honey drizzle.',
    image: frappuccinoImg,
    calories: 220,
    badge: 'CREAMY SHAKE',
  },
];

export const CONSTRUCTOR_OPTIONS = {
  sizes: ['XS(10CM)', 'S(12CM)', 'M(15CM)', 'L(18CM)'],
  mains: [
    { name: 'Wok-fired Handmade Egg Noodles',  addon: 2.00 },
    { name: 'Sichuan Sesame Chili Noodles',     addon: 1.50 },
    { name: 'Garden Fresh Tossed Salad',        addon: 0.00 },
  ],
  drinks: [
    { name: 'Peach Garden Strawberry Matcha Latte', addon: 1.00 },
    { name: 'Peach Oatmeal Cream Smoothie',          addon: 0.50 },
  ],
  sides: [
    { name: 'Creamy Potato & Egg Salad Plate',   addon: 1.50 },
    { name: 'Signature Chili Soy Dipping Sauce', addon: 0.00 },
  ],
  toppings: [
    { name: 'House Sesame Garlic Crunch',                addon: 0.50 },
    { name: 'Extra Sliced Peach & Sweet Strawberries',   addon: 0.75 },
    { name: 'Fresh Chili Crunch Dressing Spray',         addon: 0.25 },
  ],
};
