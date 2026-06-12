from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import jwt, JWTError
import asyncio
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

SECRET_KEY = os.environ.get('JWT_SECRET', 'organic-shop-secret-key-change-me-please')
ALGO = 'HS256'
TOKEN_EXP_HOURS = 24 * 7

pwd_ctx = CryptContext(schemes=['bcrypt'], deprecated='auto')
bearer = HTTPBearer(auto_error=False)

app = FastAPI()
api = APIRouter(prefix='/api')


# ------------ Models ------------
class UserSignup(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    role: str = 'customer'

class Category(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str
    name: str
    icon: str
    image: Optional[str] = None

class ProductCreate(BaseModel):
    name: str
    slug: Optional[str] = None
    description: str
    price: float
    oldPrice: Optional[float] = None
    image: str  # URL or base64 data URL
    images: Optional[List[str]] = []
    category: str
    unit: Optional[str] = '1 kg'
    stock: int = 100
    organic: bool = True
    featured: bool = False
    tags: Optional[List[str]] = []

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    oldPrice: Optional[float] = None
    image: Optional[str] = None
    images: Optional[List[str]] = None
    category: Optional[str] = None
    unit: Optional[str] = None
    stock: Optional[int] = None
    organic: Optional[bool] = None
    featured: Optional[bool] = None
    tags: Optional[List[str]] = None

class OrderItem(BaseModel):
    productId: str
    name: str
    image: str
    price: float
    qty: int
    unit: Optional[str] = None

class Address(BaseModel):
    fullName: str
    phone: str
    address: str
    area: str
    city: str = 'Dhaka'
    note: Optional[str] = None

class OrderCreate(BaseModel):
    items: List[OrderItem]
    address: Address
    paymentMethod: Literal['cod', 'bkash', 'nagad']
    paymentPhone: Optional[str] = None
    paymentTxn: Optional[str] = None
    subtotal: float
    delivery: float
    total: float

class OrderStatusUpdate(BaseModel):
    status: Literal['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

class PaymentInitiate(BaseModel):
    method: Literal['bkash', 'nagad']
    phone: str
    amount: float

class PaymentVerify(BaseModel):
    sessionId: str
    otp: str


# ------------ Helpers ------------
def hash_password(p: str) -> str: return pwd_ctx.hash(p)
def verify_password(p: str, h: str) -> bool:
    try: return pwd_ctx.verify(p, h)
    except Exception: return False

def create_token(user_id: str, role: str) -> str:
    payload = {
        'sub': user_id,
        'role': role,
        'exp': datetime.utcnow() + timedelta(hours=TOKEN_EXP_HOURS)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGO)

async def get_current_user(creds: Optional[HTTPAuthorizationCredentials] = Depends(bearer)):
    if not creds: raise HTTPException(401, 'Not authenticated')
    try:
        payload = jwt.decode(creds.credentials, SECRET_KEY, algorithms=[ALGO])
        user = await db.users.find_one({'id': payload['sub']})
        if not user: raise HTTPException(401, 'User not found')
        return user
    except JWTError:
        raise HTTPException(401, 'Invalid token')

async def get_admin(user = Depends(get_current_user)):
    if user.get('role') != 'admin':
        raise HTTPException(403, 'Admin access required')
    return user

def slugify(s: str) -> str:
    import re
    s = s.lower().strip()
    s = re.sub(r'[^a-z0-9\s-]', '', s)
    s = re.sub(r'[\s-]+', '-', s)
    return s


# ------------ Routes ------------
@api.get('/')
async def root(): return {'message': 'Organic Shop API'}

# Auth
@api.post('/auth/signup')
async def signup(body: UserSignup):
    if await db.users.find_one({'email': body.email}):
        raise HTTPException(400, 'Email already registered')
    user = {
        'id': str(uuid.uuid4()),
        'name': body.name,
        'email': body.email,
        'phone': body.phone,
        'password': hash_password(body.password),
        'role': 'customer',
        'createdAt': datetime.utcnow().isoformat(),
    }
    await db.users.insert_one(user)
    token = create_token(user['id'], 'customer')
    return {'token': token, 'user': {'id': user['id'], 'name': user['name'], 'email': user['email'], 'phone': user['phone'], 'role': user['role']}}

@api.post('/auth/login')
async def login(body: UserLogin):
    user = await db.users.find_one({'email': body.email})
    if not user or not verify_password(body.password, user['password']):
        raise HTTPException(401, 'Invalid email or password')
    token = create_token(user['id'], user.get('role', 'customer'))
    return {'token': token, 'user': {'id': user['id'], 'name': user['name'], 'email': user['email'], 'phone': user['phone'], 'role': user.get('role', 'customer')}}

@api.get('/auth/me')
async def me(user = Depends(get_current_user)):
    return {'id': user['id'], 'name': user['name'], 'email': user['email'], 'phone': user['phone'], 'role': user.get('role', 'customer')}


# Categories
@api.get('/categories')
async def list_categories():
    cats = await db.categories.find().to_list(100)
    for c in cats: c.pop('_id', None)
    return cats


# Products
@api.get('/products')
async def list_products(category: Optional[str] = None, featured: Optional[bool] = None, q: Optional[str] = None):
    query = {}
    if category: query['category'] = category
    if featured is not None: query['featured'] = featured
    if q:
        query['$or'] = [
            {'name': {'$regex': q, '$options': 'i'}},
            {'description': {'$regex': q, '$options': 'i'}},
        ]
    products = await db.products.find(query).sort('createdAt', -1).to_list(500)
    for p in products: p.pop('_id', None)
    return products

@api.get('/products/{slug}')
async def get_product(slug: str):
    p = await db.products.find_one({'slug': slug})
    if not p: raise HTTPException(404, 'Product not found')
    p.pop('_id', None)
    return p

@api.post('/products')
async def create_product(body: ProductCreate, admin = Depends(get_admin)):
    slug = body.slug or slugify(body.name)
    if await db.products.find_one({'slug': slug}):
        slug = f"{slug}-{str(uuid.uuid4())[:6]}"
    product = {
        'id': str(uuid.uuid4()),
        'slug': slug,
        'name': body.name,
        'description': body.description,
        'price': body.price,
        'oldPrice': body.oldPrice,
        'discount': int(round((1 - body.price / body.oldPrice) * 100)) if body.oldPrice and body.oldPrice > body.price else None,
        'image': body.image,
        'images': body.images or [body.image],
        'category': body.category,
        'unit': body.unit,
        'stock': body.stock,
        'organic': body.organic,
        'featured': body.featured,
        'tags': body.tags or [],
        'createdAt': datetime.utcnow().isoformat(),
    }
    await db.products.insert_one(product)
    product.pop('_id', None)
    return product

@api.put('/products/{product_id}')
async def update_product(product_id: str, body: ProductUpdate, admin = Depends(get_admin)):
    existing = await db.products.find_one({'id': product_id})
    if not existing: raise HTTPException(404, 'Product not found')
    update = {k: v for k, v in body.model_dump(exclude_unset=True).items() if v is not None}
    if 'price' in update or 'oldPrice' in update:
        price = update.get('price', existing.get('price'))
        old = update.get('oldPrice', existing.get('oldPrice'))
        update['discount'] = int(round((1 - price / old) * 100)) if old and old > price else None
    await db.products.update_one({'id': product_id}, {'$set': update})
    p = await db.products.find_one({'id': product_id})
    p.pop('_id', None)
    return p

@api.delete('/products/{product_id}')
async def delete_product(product_id: str, admin = Depends(get_admin)):
    res = await db.products.delete_one({'id': product_id})
    if res.deleted_count == 0: raise HTTPException(404, 'Product not found')
    return {'ok': True}


# Payments — simulated
@api.post('/payments/initiate')
async def payment_initiate(body: PaymentInitiate):
    """Simulates bKash/Nagad payment flow.  Returns a sessionId; client then verifies with OTP."""
    if len(body.phone) < 10:
        raise HTTPException(400, 'Invalid phone')
    session = {
        'id': str(uuid.uuid4()),
        'method': body.method,
        'phone': body.phone,
        'amount': body.amount,
        # Demo OTP — always 1234 for ease of testing in MVP. In real life this would be sent via SMS.
        'otp': '1234',
        'status': 'pending',
        'createdAt': datetime.utcnow().isoformat(),
    }
    await db.payment_sessions.insert_one(session)
    await asyncio.sleep(0.5)  # simulate network latency
    return {
        'sessionId': session['id'],
        'method': session['method'],
        'amount': session['amount'],
        'phone': session['phone'],
        # We return the demo otp so users know what to enter; real systems do not.
        'demoOtp': '1234',
        'message': f"OTP sent to {session['phone']} (demo OTP is 1234)"
    }

@api.post('/payments/verify')
async def payment_verify(body: PaymentVerify):
    session = await db.payment_sessions.find_one({'id': body.sessionId})
    if not session: raise HTTPException(404, 'Payment session not found')
    if session['status'] == 'verified':
        return {'verified': True, 'txnId': session.get('txnId')}
    if body.otp != session['otp']:
        raise HTTPException(400, 'Invalid OTP')
    txn = f"TXN{random.randint(10**9, 10**10 - 1)}"
    await db.payment_sessions.update_one({'id': session['id']}, {'$set': {'status': 'verified', 'txnId': txn}})
    return {'verified': True, 'txnId': txn, 'method': session['method'], 'amount': session['amount']}


# Orders
@api.post('/orders')
async def create_order(body: OrderCreate, user = Depends(get_current_user)):
    order = {
        'id': str(uuid.uuid4()),
        'orderNo': f"ORD-{datetime.utcnow().strftime('%y%m%d')}-{random.randint(1000, 9999)}",
        'userId': user['id'],
        'userName': user['name'],
        'userPhone': user['phone'],
        'items': [i.model_dump() for i in body.items],
        'address': body.address.model_dump(),
        'paymentMethod': body.paymentMethod,
        'paymentPhone': body.paymentPhone,
        'paymentTxn': body.paymentTxn,
        'subtotal': body.subtotal,
        'delivery': body.delivery,
        'total': body.total,
        'status': 'confirmed' if body.paymentMethod != 'cod' else 'pending',
        'paymentStatus': 'paid' if body.paymentMethod != 'cod' else 'unpaid',
        'createdAt': datetime.utcnow().isoformat(),
    }
    await db.orders.insert_one(order)
    order.pop('_id', None)
    return order

@api.get('/orders/my')
async def my_orders(user = Depends(get_current_user)):
    orders = await db.orders.find({'userId': user['id']}).sort('createdAt', -1).to_list(200)
    for o in orders: o.pop('_id', None)
    return orders

@api.get('/orders/{order_id}')
async def get_order(order_id: str, user = Depends(get_current_user)):
    o = await db.orders.find_one({'id': order_id})
    if not o: raise HTTPException(404, 'Order not found')
    if o['userId'] != user['id'] and user.get('role') != 'admin':
        raise HTTPException(403, 'Forbidden')
    o.pop('_id', None)
    return o

@api.get('/admin/orders')
async def admin_orders(admin = Depends(get_admin)):
    orders = await db.orders.find().sort('createdAt', -1).to_list(500)
    for o in orders: o.pop('_id', None)
    return orders

@api.patch('/admin/orders/{order_id}')
async def admin_update_order(order_id: str, body: OrderStatusUpdate, admin = Depends(get_admin)):
    res = await db.orders.update_one({'id': order_id}, {'$set': {'status': body.status}})
    if res.matched_count == 0: raise HTTPException(404, 'Order not found')
    o = await db.orders.find_one({'id': order_id}); o.pop('_id', None)
    return o

@api.get('/admin/stats')
async def admin_stats(admin = Depends(get_admin)):
    products = await db.products.count_documents({})
    orders = await db.orders.count_documents({})
    customers = await db.users.count_documents({'role': 'customer'})
    pipeline = [{'$group': {'_id': None, 'total': {'$sum': '$total'}}}]
    cur = db.orders.aggregate(pipeline)
    rev = 0
    async for d in cur: rev = d.get('total', 0)
    pending = await db.orders.count_documents({'status': 'pending'})
    return {'products': products, 'orders': orders, 'customers': customers, 'revenue': rev, 'pendingOrders': pending}


@api.get('/admin/users')
async def admin_users(admin = Depends(get_admin)):
    users = await db.users.find({'role': 'customer'}).sort('createdAt', -1).to_list(500)
    out = []
    for u in users:
        u.pop('_id', None); u.pop('password', None)
        order_count = await db.orders.count_documents({'userId': u['id']})
        pipeline = [{'$match': {'userId': u['id']}}, {'$group': {'_id': None, 'total': {'$sum': '$total'}}}]
        spent = 0
        async for d in db.orders.aggregate(pipeline): spent = d.get('total', 0)
        u['orderCount'] = order_count
        u['totalSpent'] = spent
        out.append(u)
    return out


@api.get('/admin/users/{user_id}')
async def admin_user_detail(user_id: str, admin = Depends(get_admin)):
    u = await db.users.find_one({'id': user_id})
    if not u: raise HTTPException(404, 'User not found')
    u.pop('_id', None); u.pop('password', None)
    orders = await db.orders.find({'userId': user_id}).sort('createdAt', -1).to_list(200)
    for o in orders: o.pop('_id', None)
    return {'user': u, 'orders': orders}


# ------------ Seed ------------
ORGANIC_CATEGORIES = [
    {'slug': 'fruits-vegetables', 'name': 'Fruits & Vegetables', 'icon': 'Apple', 'image': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&q=80'},
    {'slug': 'honey-sweeteners', 'name': 'Honey & Sweeteners', 'icon': 'Candy', 'image': 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&q=80'},
    {'slug': 'oils-ghee', 'name': 'Oils & Ghee', 'icon': 'Droplet', 'image': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80'},
    {'slug': 'spices', 'name': 'Spices', 'icon': 'Flame', 'image': 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=400&q=80'},
    {'slug': 'grains-pulses', 'name': 'Grains & Pulses', 'icon': 'Wheat', 'image': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80'},
    {'slug': 'dairy', 'name': 'Dairy', 'icon': 'Milk', 'image': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&q=80'},
    {'slug': 'tea-beverages', 'name': 'Tea & Beverages', 'icon': 'Coffee', 'image': 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=400&q=80'},
    {'slug': 'personal-care', 'name': 'Personal Care', 'icon': 'Sparkles', 'image': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80'},
]

SEED_PRODUCTS = [
    {'name': 'Organic Sundarban Honey', 'description': '100% pure raw honey collected from the Sundarbans — unprocessed, unfiltered, naturally rich in antioxidants.', 'price': 750, 'oldPrice': 950, 'image': 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&q=80', 'category': 'honey-sweeteners', 'unit': '500 g', 'featured': True, 'stock': 50},
    {'name': 'Cold-Pressed Mustard Oil', 'description': 'Wood-pressed mustard oil from organic mustard seeds — pungent, golden, traditional Bengali kitchen staple.', 'price': 420, 'oldPrice': 520, 'image': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80', 'category': 'oils-ghee', 'unit': '1 L', 'featured': True, 'stock': 80},
    {'name': 'Pure Cow Ghee', 'description': 'Hand-churned bilona ghee from grass-fed cows. Rich aroma, golden grain — perfect for cooking & wellness.', 'price': 1450, 'oldPrice': 1650, 'image': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80', 'category': 'oils-ghee', 'unit': '500 g', 'featured': True, 'stock': 40},
    {'name': 'Organic Red Chilli Powder', 'description': 'Sun-dried & stone-ground red chillies — no artificial colours, no preservatives. Smoky, sharp heat.', 'price': 240, 'oldPrice': 300, 'image': 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=800&q=80', 'category': 'spices', 'unit': '250 g', 'featured': True, 'stock': 120},
    {'name': 'Organic Turmeric Powder', 'description': 'High-curcumin organic turmeric — golden, earthy, anti-inflammatory. Stone-ground in small batches.', 'price': 180, 'image': 'https://images.unsplash.com/photo-1615485500704-8e990f9900e7?w=800&q=80', 'category': 'spices', 'unit': '250 g', 'stock': 100},
    {'name': 'Organic Brown Rice', 'description': 'Unpolished aromatic brown rice — high in fibre, slow-grown without chemicals. Wholesome staple.', 'price': 180, 'oldPrice': 220, 'image': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80', 'category': 'grains-pulses', 'unit': '1 kg', 'stock': 200},
    {'name': 'Organic Red Lentils (Masoor Dal)', 'description': 'Premium organic split red lentils. Cooks fast, naturally sweet, protein-rich daily essential.', 'price': 160, 'image': 'https://images.unsplash.com/photo-1612257999782-1d3d1d3d4f4f?w=800&q=80', 'category': 'grains-pulses', 'unit': '1 kg', 'stock': 150},
    {'name': 'Farm Fresh Tomatoes', 'description': 'Vine-ripened organic tomatoes, picked the same morning. Juicy, sweet & full of flavour.', 'price': 80, 'oldPrice': 100, 'image': 'https://images.unsplash.com/photo-1546470427-e84a4b3ea0f5?w=800&q=80', 'category': 'fruits-vegetables', 'unit': '1 kg', 'featured': True, 'stock': 60},
    {'name': 'Organic Spinach Bunch', 'description': 'Hand-picked organic spinach — pesticide-free, washed, ready to cook. Iron-rich leafy goodness.', 'price': 45, 'image': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&q=80', 'category': 'fruits-vegetables', 'unit': '500 g', 'stock': 40},
    {'name': 'Sweet Bananas (Sagor Kola)', 'description': 'Chemical-free, naturally ripened sagor bananas. Creamy texture, mellow sweetness.', 'price': 90, 'image': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&q=80', 'category': 'fruits-vegetables', 'unit': '1 dozen', 'stock': 80},
    {'name': 'Pure Cow Milk', 'description': 'Fresh whole milk from grass-fed cows, delivered chilled. No preservatives, no powder.', 'price': 110, 'image': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=800&q=80', 'category': 'dairy', 'unit': '1 L', 'stock': 30},
    {'name': 'Organic Set Yogurt (Doi)', 'description': 'Slow-set creamy yogurt in earthen pots — traditional, mildly tangy, probiotic-rich.', 'price': 140, 'oldPrice': 170, 'image': 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=800&q=80', 'category': 'dairy', 'unit': '500 g', 'stock': 25},
    {'name': 'Organic Sylhet Tea Leaves', 'description': 'Single-estate organic black tea from Sylhet hills. Bold, malty, brewed strong.', 'price': 320, 'oldPrice': 400, 'image': 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=800&q=80', 'category': 'tea-beverages', 'unit': '250 g', 'featured': True, 'stock': 70},
    {'name': 'Cold-Pressed Coconut Oil', 'description': 'Virgin coconut oil — cold-pressed for skin, hair & cooking. Mild aroma, all natural.', 'price': 380, 'image': 'https://images.unsplash.com/photo-1638515767867-c8b80fdf6c4d?w=800&q=80', 'category': 'personal-care', 'unit': '500 ml', 'stock': 90},
    {'name': 'Neem & Tulsi Handmade Soap', 'description': 'Cold-process handmade soap with neem & tulsi extracts — gentle, antibacterial, plastic-free.', 'price': 120, 'image': 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=800&q=80', 'category': 'personal-care', 'unit': '100 g', 'stock': 200},
    {'name': 'Organic Black Pepper', 'description': 'Whole organic black peppercorns — sharp, fragrant, hand-graded. Grind fresh for best aroma.', 'price': 280, 'image': 'https://images.unsplash.com/photo-1599909533730-d4ae292ce5dd?w=800&q=80', 'category': 'spices', 'unit': '100 g', 'stock': 110},
]


@app.on_event('startup')
async def seed():
    # Admin user
    if not await db.users.find_one({'role': 'admin'}):
        await db.users.insert_one({
            'id': str(uuid.uuid4()),
            'name': 'Admin',
            'email': 'admin@organicshop.com',
            'phone': '01700000000',
            'password': hash_password('admin123'),
            'role': 'admin',
            'createdAt': datetime.utcnow().isoformat(),
        })
        logging.info('Seeded admin user: admin@organicshop.com / admin123')

    # Categories
    if await db.categories.count_documents({}) == 0:
        for c in ORGANIC_CATEGORIES:
            await db.categories.insert_one({'id': str(uuid.uuid4()), **c})
        logging.info('Seeded categories')

    # Products
    if await db.products.count_documents({}) == 0:
        for p in SEED_PRODUCTS:
            slug = slugify(p['name'])
            discount = int(round((1 - p['price'] / p['oldPrice']) * 100)) if p.get('oldPrice') and p['oldPrice'] > p['price'] else None
            await db.products.insert_one({
                'id': str(uuid.uuid4()),
                'slug': slug,
                'name': p['name'],
                'description': p['description'],
                'price': p['price'],
                'oldPrice': p.get('oldPrice'),
                'discount': discount,
                'image': p['image'],
                'images': [p['image']],
                'category': p['category'],
                'unit': p.get('unit', '1 kg'),
                'stock': p.get('stock', 100),
                'organic': True,
                'featured': p.get('featured', False),
                'createdAt': datetime.utcnow().isoformat(),
            })
        logging.info('Seeded products')


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*'],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event('shutdown')
async def shutdown_db_client(): client.close()
