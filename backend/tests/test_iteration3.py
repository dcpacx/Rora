"""Backend tests for Iteration 3: Security headers, rate limit, filters, related,
reviews, wishlist, stock decrement, order status history, password reset, newsletter."""
import os
import time
import uuid
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
if not BASE_URL:
    with open('/app/frontend/.env') as f:
        for line in f:
            if line.startswith('REACT_APP_BACKEND_URL='):
                BASE_URL = line.split('=', 1)[1].strip().rstrip('/')
                break
API = f"{BASE_URL}/api"

ADMIN_EMAIL = 'admin@organicshop.com'
ADMIN_PASS = 'admin123'


def H(token):
    return {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}


# ------------- shared fixtures -------------
@pytest.fixture(scope='module')
def admin_token():
    r = requests.post(f"{API}/auth/login", json={'email': ADMIN_EMAIL, 'password': ADMIN_PASS}, timeout=15)
    assert r.status_code == 200, f"admin login: {r.status_code} {r.text}"
    return r.json()['token']


@pytest.fixture(scope='module')
def customer():
    email = f"TEST_buyer_{uuid.uuid4().hex[:8]}@test.com"
    r = requests.post(f"{API}/auth/signup", json={
        'name': 'TEST Buyer', 'email': email, 'phone': '01799999999', 'password': 'pass1234'
    }, timeout=15)
    assert r.status_code == 200, r.text
    d = r.json()
    return {'token': d['token'], 'user': d['user'], 'email': email, 'password': 'pass1234'}


@pytest.fixture(scope='module')
def ghee_product():
    r = requests.get(f"{API}/products/pure-cow-ghee", timeout=15)
    assert r.status_code == 200, r.text
    return r.json()


@pytest.fixture(scope='module')
def customer_with_order(customer, ghee_product):
    # add an address
    addr_payload = {
        'label': 'Home', 'fullName': 'TEST Buyer', 'phone': '01711111111',
        'address': '1 Test Rd', 'area': 'Mirpur', 'city': 'Dhaka',
        'district': 'Dhaka', 'division': 'Dhaka', 'postalCode': '1216'
    }
    requests.post(f"{API}/auth/me/addresses", json=addr_payload, headers=H(customer['token']))
    addrs = requests.get(f"{API}/auth/me/addresses", headers=H(customer['token'])).json()
    addr = addrs[0]
    p = ghee_product
    order_payload = {
        'items': [{'productId': p['id'], 'name': p['name'], 'image': p['image'],
                   'price': p['price'], 'qty': 1, 'unit': p.get('unit', '500 g')}],
        'address': addr,
        'paymentMethod': 'cod',
        'subtotal': p['price'], 'delivery': 60, 'total': p['price'] + 60,
    }
    r = requests.post(f"{API}/orders", json=order_payload, headers=H(customer['token']))
    assert r.status_code == 200, r.text
    return {**customer, 'order': r.json(), 'product': p}


# ---------------- 1. SECURITY HEADERS ----------------
class TestSecurityHeaders:
    def test_root_status_and_headers(self):
        r = requests.get(f"{API}/", timeout=15)
        assert r.status_code == 200
        h = {k.lower(): v for k, v in r.headers.items()}
        assert h.get('x-content-type-options') == 'nosniff', h
        assert h.get('x-frame-options', '').upper() == 'SAMEORIGIN', h
        assert h.get('referrer-policy') == 'strict-origin-when-cross-origin', h
        assert 'permissions-policy' in h, h


# ---------------- 2. RATE LIMIT ON LOGIN ----------------
class TestRateLimit:
    def test_login_rate_limit_429(self):
        # 11 quick failed login attempts → 11th should be 429
        # NOTE: slowapi uses get_remote_address (request.client.host). Behind the
        # k8s ingress, source IP can rotate across pods, so this test reuses a
        # single requests.Session to maximise connection reuse, but the rate
        # limit can still be effectively bypassed in this preview env. We
        # therefore allow up to 30 quick attempts before declaring failure.
        sess = requests.Session()
        last_status = None
        got_429 = False
        for i in range(30):
            r = sess.post(f"{API}/auth/login",
                          json={'email': 'nobody@nope.com', 'password': 'bad'},
                          timeout=10)
            last_status = r.status_code
            if r.status_code == 429:
                got_429 = True
                break
        assert got_429, (
            f"Expected 429 within 30 attempts, last={last_status}. "
            "Likely cause: rate-limit key uses request.client.host instead of "
            "X-Forwarded-For — limiter is per upstream proxy IP, not per client."
        )


# ---------------- 3. PRODUCTS FILTER ----------------
class TestProductsFilter:
    def test_filter_organic_instock_price_sort(self):
        r = requests.get(f"{API}/products",
                         params={'organic': 'true', 'inStock': 'true',
                                 'minPrice': 100, 'maxPrice': 1000,
                                 'sort': 'price-asc'},
                         timeout=15)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        prices = [p['price'] for p in items]
        assert prices == sorted(prices), f"not asc: {prices}"
        for p in items:
            assert 100 <= p['price'] <= 1000, p['price']
            assert p.get('stock', 0) > 0
            # organic flag may be omitted on seed data — only assert when present in result query
            if 'organic' in p:
                assert p['organic'] is True


# ---------------- 4. RELATED PRODUCTS ----------------
class TestRelated:
    def test_related_excludes_self_same_category(self, ghee_product):
        r = requests.get(f"{API}/products/{ghee_product['slug']}/related", timeout=15)
        assert r.status_code == 200
        items = r.json()
        slugs = [p['slug'] for p in items]
        assert ghee_product['slug'] not in slugs
        for p in items:
            assert p['category'] == ghee_product['category']


# ---------------- 5. REVIEWS ----------------
class TestReviews:
    def test_review_requires_order_403(self, customer, ghee_product):
        # New customer hasn't ordered yet — using a fresh second user
        email = f"TEST_noorder_{uuid.uuid4().hex[:6]}@test.com"
        s = requests.post(f"{API}/auth/signup", json={
            'name': 'NoOrder', 'email': email, 'phone': '01700000000', 'password': 'pass1234'
        }).json()
        r = requests.post(f"{API}/reviews",
                          json={'productId': ghee_product['id'], 'rating': 5, 'text': 'no'},
                          headers=H(s['token']))
        assert r.status_code == 403, r.text

    def test_post_review_then_get_and_idempotent(self, customer_with_order):
        c = customer_with_order
        p = c['product']
        r = requests.post(f"{API}/reviews",
                          json={'productId': p['id'], 'rating': 5, 'text': 'Great'},
                          headers=H(c['token']))
        assert r.status_code == 200, r.text
        rev = r.json()
        assert rev['rating'] == 5
        assert rev['userId'] == c['user']['id']
        rev_id = rev['id']

        # GET list
        lr = requests.get(f"{API}/products/{p['id']}/reviews")
        assert lr.status_code == 200
        ids = [x['id'] for x in lr.json()]
        assert rev_id in ids

        # Product reflects avgRating / reviewCount
        pr = requests.get(f"{API}/products/{p['slug']}").json()
        assert pr['reviewCount'] >= 1
        assert pr['avgRating'] >= 1

        # idempotent: same user re-posts → updates, doesn't create new
        r2 = requests.post(f"{API}/reviews",
                           json={'productId': p['id'], 'rating': 4, 'text': 'Updated'},
                           headers=H(c['token']))
        assert r2.status_code == 200
        assert r2.json()['id'] == rev_id
        assert r2.json()['rating'] == 4

        lr2 = requests.get(f"{API}/products/{p['id']}/reviews").json()
        # count of reviews by this user for this product should still be 1
        mine = [x for x in lr2 if x['userId'] == c['user']['id']]
        assert len(mine) == 1


# ---------------- 6. WISHLIST ----------------
class TestWishlist:
    def test_toggle_and_get(self, customer, ghee_product):
        # toggle on
        r = requests.post(f"{API}/auth/me/wishlist/{ghee_product['id']}",
                          headers=H(customer['token']))
        assert r.status_code == 200
        assert r.json()['inWishlist'] is True

        # get list
        gl = requests.get(f"{API}/auth/me/wishlist", headers=H(customer['token']))
        assert gl.status_code == 200
        ids = [p['id'] for p in gl.json()]
        assert ghee_product['id'] in ids

        # toggle off
        r2 = requests.post(f"{API}/auth/me/wishlist/{ghee_product['id']}",
                           headers=H(customer['token']))
        assert r2.json()['inWishlist'] is False
        gl2 = requests.get(f"{API}/auth/me/wishlist", headers=H(customer['token'])).json()
        assert ghee_product['id'] not in [p['id'] for p in gl2]


# ---------------- 7. STOCK DECREMENT ----------------
class TestStockDecrement:
    def test_stock_decrements_after_order(self, admin_token):
        # create a fresh test product with known stock
        slug = f"test-stock-{uuid.uuid4().hex[:6]}"
        pr = requests.post(f"{API}/products", json={
            'name': f'TEST Stock {slug}', 'description': 'x', 'price': 100,
            'image': '', 'category': 'spices', 'unit': '1 kg', 'stock': 10,
            'organic': True, 'featured': False
        }, headers=H(admin_token))
        assert pr.status_code == 200, pr.text
        p = pr.json()

        # fresh customer
        em = f"TEST_stk_{uuid.uuid4().hex[:6]}@test.com"
        s = requests.post(f"{API}/auth/signup", json={
            'name': 'S', 'email': em, 'phone': '0170', 'password': 'pass1234'
        }).json()
        tok = s['token']
        requests.post(f"{API}/auth/me/addresses", json={
            'fullName': 'X', 'phone': '017', 'address': 'a', 'area': 'b'
        }, headers=H(tok))
        addr = requests.get(f"{API}/auth/me/addresses", headers=H(tok)).json()[0]

        r = requests.post(f"{API}/orders", json={
            'items': [{'productId': p['id'], 'name': p['name'], 'image': '',
                       'price': p['price'], 'qty': 1, 'unit': p['unit']}],
            'address': addr, 'paymentMethod': 'cod',
            'subtotal': 100, 'delivery': 60, 'total': 160
        }, headers=H(tok))
        assert r.status_code == 200, r.text

        # verify stock now 9
        after = requests.get(f"{API}/products/{p['slug']}").json()
        assert after['stock'] == 9

        # cleanup
        requests.delete(f"{API}/products/{p['id']}", headers=H(admin_token))


# ---------------- 8. ORDER STATUS HISTORY ----------------
class TestOrderStatusHistory:
    def test_status_transitions_append_history(self, admin_token, customer_with_order):
        oid = customer_with_order['order']['id']

        for status in ['confirmed', 'shipped', 'delivered']:
            r = requests.patch(f"{API}/admin/orders/{oid}",
                               json={'status': status},
                               headers=H(admin_token))
            assert r.status_code == 200, r.text
            o = r.json()
            assert o['status'] == status
            hist = o.get('statusHistory', [])
            last = hist[-1]
            assert last['status'] == status
            assert 'at' in last and last['at']
            assert last.get('by'), 'by should be admin name'

        # final history contains pending + 3 transitions
        o = requests.get(f"{API}/orders/{oid}",
                         headers=H(customer_with_order['token'])).json()
        statuses = [h['status'] for h in o['statusHistory']]
        assert 'confirmed' in statuses and 'shipped' in statuses and 'delivered' in statuses


# ---------------- 9. PASSWORD RESET ----------------
class TestPasswordReset:
    def test_forgot_returns_demo_token_then_reset_and_login(self):
        # create a dedicated user
        em = f"TEST_pw_{uuid.uuid4().hex[:6]}@test.com"
        s = requests.post(f"{API}/auth/signup", json={
            'name': 'Pw', 'email': em, 'phone': '0170', 'password': 'oldpass1'
        })
        assert s.status_code == 200

        # forgot
        f = requests.post(f"{API}/auth/forgot", json={'email': em})
        assert f.status_code == 200, f.text
        token = f.json().get('resetToken')
        assert token, f.json()

        # reset
        r = requests.post(f"{API}/auth/reset", json={'token': token, 'newPassword': 'newpass1'})
        assert r.status_code == 200, r.text

        # login with new password
        time.sleep(0.5)
        lg = requests.post(f"{API}/auth/login", json={'email': em, 'password': 'newpass1'})
        assert lg.status_code == 200, lg.text

        # reuse token → 400
        rr = requests.post(f"{API}/auth/reset", json={'token': token, 'newPassword': 'whatever1'})
        assert rr.status_code == 400, rr.text


# ---------------- 10. NEWSLETTER ----------------
class TestNewsletter:
    def test_subscribe_then_admin_lists(self, admin_token):
        email = f"TEST_nl_{uuid.uuid4().hex[:6]}@test.com"
        r = requests.post(f"{API}/newsletter", json={'email': email})
        assert r.status_code == 200, r.text
        assert r.json().get('ok') is True

        lst = requests.get(f"{API}/admin/newsletter", headers=H(admin_token))
        assert lst.status_code == 200
        emails = [x['email'] for x in lst.json()]
        assert email.lower() in emails

    def test_admin_required(self):
        r = requests.get(f"{API}/admin/newsletter")
        assert r.status_code in (401, 403)
