"""Backend tests for Organic Shop: Auth, Address book, Site settings, Banners, Coupons, Orders."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
if not BASE_URL:
    # fallback to reading frontend env
    try:
        with open('/app/frontend/.env') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    BASE_URL = line.split('=', 1)[1].strip().rstrip('/')
                    break
    except Exception:
        pass

API = f"{BASE_URL}/api"
ADMIN_EMAIL = 'admin@organicshop.com'
ADMIN_PASS = 'admin123'


@pytest.fixture(scope='session')
def admin_token():
    r = requests.post(f"{API}/auth/login", json={'email': ADMIN_EMAIL, 'password': ADMIN_PASS}, timeout=15)
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    return r.json()['token']


@pytest.fixture(scope='session')
def new_user():
    email = f"TEST_user_{uuid.uuid4().hex[:8]}@example.com"
    r = requests.post(f"{API}/auth/signup", json={
        'name': 'TEST User', 'email': email, 'phone': '01700000001', 'password': 'pass1234'
    }, timeout=15)
    assert r.status_code == 200, f"Signup failed: {r.status_code} {r.text}"
    data = r.json()
    return {'token': data['token'], 'user': data['user'], 'email': email}


def H(token):
    return {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}


# ----------------- AUTH -----------------
class TestAuth:
    def test_admin_login(self, admin_token):
        assert isinstance(admin_token, str) and len(admin_token) > 20

    def test_signup_new(self, new_user):
        assert new_user['user']['role'] == 'customer'
        assert new_user['user']['email'] == new_user['email']


# ----------------- ADDRESS BOOK -----------------
class TestAddressBook:
    def test_empty_initial(self, new_user):
        r = requests.get(f"{API}/auth/me/addresses", headers=H(new_user['token']))
        assert r.status_code == 200
        assert r.json() == []

    def test_first_address_auto_default(self, new_user):
        payload = {
            'label': 'Home', 'fullName': 'Test One', 'phone': '01711111111',
            'address': '12 Test Road', 'area': 'Mirpur', 'city': 'Dhaka',
            'district': 'Dhaka', 'division': 'Dhaka', 'postalCode': '1216',
            'isDefault': False
        }
        r = requests.post(f"{API}/auth/me/addresses", json=payload, headers=H(new_user['token']))
        assert r.status_code == 200, r.text
        a = r.json()
        assert a['isDefault'] is True  # first address auto-default
        new_user['addr1'] = a['id']

    def test_add_second_non_default(self, new_user):
        payload = {
            'label': 'Office', 'fullName': 'Test Two', 'phone': '01722222222',
            'address': '99 Office Ln', 'area': 'Gulshan'
        }
        r = requests.post(f"{API}/auth/me/addresses", json=payload, headers=H(new_user['token']))
        assert r.status_code == 200
        a = r.json()
        new_user['addr2'] = a['id']
        # second address - not default
        # verify only one default
        r2 = requests.get(f"{API}/auth/me/addresses", headers=H(new_user['token']))
        defaults = [x for x in r2.json() if x.get('isDefault')]
        assert len(defaults) == 1

    def test_update_set_default(self, new_user):
        r = requests.put(f"{API}/auth/me/addresses/{new_user['addr2']}",
                         json={'isDefault': True}, headers=H(new_user['token']))
        assert r.status_code == 200
        r2 = requests.get(f"{API}/auth/me/addresses", headers=H(new_user['token']))
        for a in r2.json():
            if a['id'] == new_user['addr2']:
                assert a['isDefault'] is True
            else:
                assert a['isDefault'] is False

    def test_update_fields(self, new_user):
        r = requests.put(f"{API}/auth/me/addresses/{new_user['addr1']}",
                         json={'fullName': 'Updated Name'}, headers=H(new_user['token']))
        assert r.status_code == 200
        assert r.json()['fullName'] == 'Updated Name'

    def test_delete_default_promotes(self, new_user):
        # delete addr2 (current default), addr1 should be promoted
        r = requests.delete(f"{API}/auth/me/addresses/{new_user['addr2']}", headers=H(new_user['token']))
        assert r.status_code == 200
        r2 = requests.get(f"{API}/auth/me/addresses", headers=H(new_user['token']))
        addrs = r2.json()
        assert len(addrs) == 1
        assert addrs[0]['isDefault'] is True


# ----------------- SITE SETTINGS -----------------
class TestSiteSettings:
    def test_get_defaults(self):
        r = requests.get(f"{API}/settings/site")
        assert r.status_code == 200
        d = r.json()
        assert 'siteName' in d and 'deliveryFee' in d

    def test_admin_update(self, admin_token):
        r = requests.put(f"{API}/admin/settings/site", json={
            'siteName': 'TEST Site', 'tagline': 'Tag', 'contactPhone': '01700000000',
            'contactEmail': 'test@example.com', 'contactAddress': 'Dhaka',
            'facebookUrl': '', 'instagramUrl': '', 'whatsappNumber': '',
            'deliveryFee': 70, 'freeDeliveryAbove': 600, 'aboutText': 'about'
        }, headers=H(admin_token))
        assert r.status_code == 200
        # verify persisted
        r2 = requests.get(f"{API}/settings/site")
        assert r2.json()['siteName'] == 'TEST Site'
        assert r2.json()['deliveryFee'] == 70


# ----------------- BANNERS -----------------
class TestBanners:
    def test_public_list(self):
        r = requests.get(f"{API}/banners")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_admin_crud(self, admin_token):
        # Create
        r = requests.post(f"{API}/admin/banners", json={
            'title': 'TEST Banner', 'subtitle': 'sub', 'image': '',
            'ctaLabel': 'Go', 'ctaLink': '/shop', 'active': True, 'order': 99
        }, headers=H(admin_token))
        assert r.status_code == 200, r.text
        bid = r.json()['id']
        # Update
        r2 = requests.put(f"{API}/admin/banners/{bid}", json={
            'title': 'TEST Banner Updated', 'subtitle': 'x', 'image': '',
            'ctaLabel': 'Go', 'ctaLink': '/shop', 'active': True, 'order': 99
        }, headers=H(admin_token))
        assert r2.status_code == 200
        assert r2.json()['title'] == 'TEST Banner Updated'
        # Admin list
        r3 = requests.get(f"{API}/admin/banners", headers=H(admin_token))
        assert any(b['id'] == bid for b in r3.json())
        # Delete
        r4 = requests.delete(f"{API}/admin/banners/{bid}", headers=H(admin_token))
        assert r4.status_code == 200

    def test_admin_required(self):
        r = requests.post(f"{API}/admin/banners", json={'title': 'X'})
        assert r.status_code in (401, 403)


# ----------------- COUPONS -----------------
class TestCoupons:
    def test_admin_list(self, admin_token):
        r = requests.get(f"{API}/admin/coupons", headers=H(admin_token))
        assert r.status_code == 200
        assert any(c['code'] == 'SOBUJ100' for c in r.json())

    def test_apply_valid(self, new_user):
        r = requests.post(f"{API}/coupons/apply",
                          json={'code': 'SOBUJ100', 'subtotal': 600},
                          headers=H(new_user['token']))
        assert r.status_code == 200, r.text
        assert r.json()['discount'] == 100

    def test_apply_below_min(self, new_user):
        r = requests.post(f"{API}/coupons/apply",
                          json={'code': 'SOBUJ100', 'subtotal': 200},
                          headers=H(new_user['token']))
        assert r.status_code == 400
        assert 'inimum' in r.text or 'min' in r.text.lower()

    def test_apply_invalid_code(self, new_user):
        r = requests.post(f"{API}/coupons/apply",
                          json={'code': 'NOPE_XYZ', 'subtotal': 1000},
                          headers=H(new_user['token']))
        assert r.status_code == 404

    def test_unique_code(self, admin_token):
        code = f"TEST{uuid.uuid4().hex[:6].upper()}"
        r = requests.post(f"{API}/admin/coupons", json={
            'code': code, 'type': 'flat', 'value': 10, 'minOrder': 0, 'active': True
        }, headers=H(admin_token))
        assert r.status_code == 200
        cid = r.json()['id']
        # duplicate
        r2 = requests.post(f"{API}/admin/coupons", json={
            'code': code, 'type': 'flat', 'value': 10, 'active': True
        }, headers=H(admin_token))
        assert r2.status_code == 400
        # cleanup
        requests.delete(f"{API}/admin/coupons/{cid}", headers=H(admin_token))


# ----------------- ORDER WITH COUPON -----------------
class TestOrderCoupon:
    def test_order_with_coupon_increments_used(self, admin_token, new_user):
        # get usedCount before
        coupons = requests.get(f"{API}/admin/coupons", headers=H(admin_token)).json()
        sobuj = next(c for c in coupons if c['code'] == 'SOBUJ100')
        before = sobuj.get('usedCount', 0)

        # need an address
        ar = requests.get(f"{API}/auth/me/addresses", headers=H(new_user['token'])).json()
        addr = ar[0] if ar else None
        if not addr:
            ar2 = requests.post(f"{API}/auth/me/addresses", json={
                'fullName': 'X', 'phone': '017', 'address': 'a', 'area': 'b'
            }, headers=H(new_user['token']))
            addr = ar2.json()

        # get a product
        prods = requests.get(f"{API}/products").json()
        p = prods[0]
        order_payload = {
            'items': [{'productId': p['id'], 'name': p['name'], 'image': p['image'],
                       'price': p['price'], 'qty': 2, 'unit': p.get('unit', '1 kg')}],
            'address': addr,
            'paymentMethod': 'cod',
            'subtotal': 600, 'delivery': 60, 'total': 560,
            'couponCode': 'SOBUJ100', 'discount': 100
        }
        r = requests.post(f"{API}/orders", json=order_payload, headers=H(new_user['token']))
        assert r.status_code == 200, r.text
        o = r.json()
        assert o['couponCode'] == 'SOBUJ100'
        assert o['discount'] == 100

        # verify increment
        coupons2 = requests.get(f"{API}/admin/coupons", headers=H(admin_token)).json()
        sobuj2 = next(c for c in coupons2 if c['code'] == 'SOBUJ100')
        assert sobuj2.get('usedCount', 0) == before + 1
