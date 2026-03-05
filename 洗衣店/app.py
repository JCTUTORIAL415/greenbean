"""
Flask backend for 洗衣店 POS System.
Serves the frontend and provides REST API for persistent data storage via SQLite.
"""
from flask import Flask, jsonify, request, render_template, abort
import json
import time
from db import (
    get_db, init_db,
    rows_to_list, row_to_dict,
    order_to_camel, member_to_camel, transaction_to_camel, blanket_to_camel
)

app = Flask(__name__)


# ══════════════════════════════════════════════════════════════════
# Frontend
# ══════════════════════════════════════════════════════════════════

@app.route('/')
def index():
    return render_template('index.html')


# ══════════════════════════════════════════════════════════════════
# Init — load all data in one call
# ══════════════════════════════════════════════════════════════════

@app.route('/api/init')
def api_init():
    """Return all application state for frontend initialisation."""
    conn = get_db()
    try:
        # Settings / counters
        state_rows = conn.execute("SELECT key, value FROM app_state").fetchall()
        state = {r['key']: r['value'] for r in state_rows}
        try:
            state['memberSettings'] = json.loads(state.get('memberSettings', '{}'))
        except Exception:
            pass

        orders = [order_to_camel(dict(r)) for r in
                  conn.execute("SELECT * FROM orders ORDER BY rowid ASC").fetchall()]
        members = [member_to_camel(dict(r)) for r in
                   conn.execute("SELECT * FROM members").fetchall()]
        transactions = [transaction_to_camel(dict(r)) for r in
                        conn.execute("SELECT * FROM transactions ORDER BY date DESC").fetchall()]
        blanket_records = [blanket_to_camel(dict(r)) for r in
                           conn.execute("SELECT * FROM blanket_records").fetchall()]
        products = rows_to_list(conn.execute("SELECT * FROM products").fetchall())
        addons = rows_to_list(conn.execute("SELECT * FROM addons").fetchall())
        zones = [r['name'] for r in conn.execute("SELECT name FROM zones").fetchall()]
        employees = rows_to_list(conn.execute(
            "SELECT id, username, nickname, role FROM employees").fetchall())

        return jsonify({
            'state': state,
            'orders': orders,
            'members': members,
            'transactions': transactions,
            'blanketRecords': blanket_records,
            'products': products,
            'addons': addons,
            'zones': zones,
            'employees': employees,
        })
    finally:
        conn.close()


# ══════════════════════════════════════════════════════════════════
# Auth
# ══════════════════════════════════════════════════════════════════

@app.route('/api/auth/login', methods=['POST'])
def auth_login():
    data = request.get_json()
    username = data.get('username', '')
    password = data.get('password', '')
    conn = get_db()
    try:
        emp = conn.execute(
            "SELECT id, username, nickname, role FROM employees WHERE username=? AND password=?",
            (username, password)
        ).fetchone()
        if emp:
            return jsonify({'ok': True, 'employee': dict(emp)})
        return jsonify({'ok': False, 'error': '帳號或密碼錯誤'}), 401
    finally:
        conn.close()


# ══════════════════════════════════════════════════════════════════
# Counters (server-side to avoid race conditions across tabs)
# ══════════════════════════════════════════════════════════════════

def _next_counter(key, prefix='', width=0):
    """Atomically increment a counter in app_state and return the new value."""
    from datetime import date
    conn = get_db()
    try:
        if key == 'dailyCounter':
            today = date.today().isoformat()
            last_date = conn.execute(
                "SELECT value FROM app_state WHERE key='lastDailyDate'"
            ).fetchone()
            last_date = last_date['value'] if last_date else ''
            if last_date != today:
                conn.execute("INSERT OR REPLACE INTO app_state VALUES ('dailyCounter','0')")
                conn.execute("INSERT OR REPLACE INTO app_state VALUES ('lastDailyDate',?)", (today,))
        conn.execute(
            "UPDATE app_state SET value=CAST(CAST(value AS INTEGER)+1 AS TEXT) WHERE key=?", (key,)
        )
        conn.commit()
        val = int(conn.execute("SELECT value FROM app_state WHERE key=?", (key,)).fetchone()['value'])
        if width:
            return prefix + str(val).zfill(width)
        return str(val)
    finally:
        conn.close()


@app.route('/api/counters/next_daily', methods=['POST'])
def next_daily():
    return jsonify({'orderNum': _next_counter('dailyCounter')})


@app.route('/api/counters/next_s', methods=['POST'])
def next_s():
    return jsonify({'orderNum': _next_counter('sCounter', 'S', 4)})


@app.route('/api/counters/next_p', methods=['POST'])
def next_p():
    return jsonify({'orderNum': _next_counter('pCounter', 'P', 4)})


# ══════════════════════════════════════════════════════════════════
# Orders
# ══════════════════════════════════════════════════════════════════

def _order_cols():
    return ('id','order_num','type','status','customer_name','phone','member_id',
            'total','orig_total','discount','date','pickup_date','zone','blanket_count',
            'remark','done_date','done_by','return_date','returned_by','collected_date',
            'collected_by','paid_amount','payment_type','member_balance_used',
            'last_operator','items')


def _camel_to_order_row(d: dict) -> dict:
    """Map camelCase frontend dict to snake_case DB columns."""
    items = d.get('items', [])
    if isinstance(items, list):
        items = json.dumps(items, ensure_ascii=False)
    return {
        'id':                  d.get('id'),
        'order_num':           d.get('orderNum'),
        'type':                d.get('type'),
        'status':              d.get('status'),
        'customer_name':       d.get('customerName'),
        'phone':               d.get('phone', ''),
        'member_id':           d.get('memberId'),
        'total':               d.get('total', 0),
        'orig_total':          d.get('origTotal', 0),
        'discount':            d.get('discount', 1),
        'date':                d.get('date'),
        'pickup_date':         d.get('pickupDate'),
        'zone':                d.get('zone', ''),
        'blanket_count':       d.get('blanketCount', 0),
        'remark':              d.get('remark', ''),
        'done_date':           d.get('doneDate'),
        'done_by':             d.get('doneBy'),
        'return_date':         d.get('returnDate'),
        'returned_by':         d.get('returnedBy'),
        'collected_date':      d.get('collectedDate'),
        'collected_by':        d.get('collectedBy'),
        'paid_amount':         d.get('paidAmount', 0),
        'payment_type':        d.get('paymentType', 'cash'),
        'member_balance_used': d.get('memberBalanceUsed', 0),
        'last_operator':       d.get('lastOperator'),
        'items':               items,
    }


@app.route('/api/orders', methods=['GET'])
def get_orders():
    conn = get_db()
    try:
        rows = conn.execute("SELECT * FROM orders ORDER BY rowid ASC").fetchall()
        return jsonify([order_to_camel(dict(r)) for r in rows])
    finally:
        conn.close()


@app.route('/api/orders', methods=['POST'])
def create_order():
    data = request.get_json()
    row = _camel_to_order_row(data)
    cols = _order_cols()
    ph = ','.join(['?'] * len(cols))
    conn = get_db()
    try:
        conn.execute(
            f"INSERT OR REPLACE INTO orders ({','.join(cols)}) VALUES ({ph})",
            [row[c] for c in cols]
        )
        conn.commit()
        return jsonify({'ok': True, 'id': row['id']}), 201
    finally:
        conn.close()


@app.route('/api/orders/<order_id>', methods=['PATCH'])
def update_order(order_id):
    data = request.get_json()
    row = _camel_to_order_row(data)
    cols = _order_cols()
    # Only update provided fields
    updates = {k: row[k] for k in cols if k in row and row[k] is not None or k in (
        'done_date','done_by','return_date','returned_by','collected_date','collected_by',
        'zone','remark','member_id','status','total','orig_total','items','last_operator'
    )}
    if not updates:
        return jsonify({'ok': True})
    set_clause = ', '.join(f"{k}=?" for k in updates)
    conn = get_db()
    try:
        conn.execute(
            f"UPDATE orders SET {set_clause} WHERE id=?",
            list(updates.values()) + [order_id]
        )
        conn.commit()
        return jsonify({'ok': True})
    finally:
        conn.close()


@app.route('/api/orders/<order_id>', methods=['DELETE'])
def delete_order(order_id):
    conn = get_db()
    try:
        conn.execute("DELETE FROM orders WHERE id=?", (order_id,))
        conn.commit()
        return jsonify({'ok': True})
    finally:
        conn.close()


# ══════════════════════════════════════════════════════════════════
# Members
# ══════════════════════════════════════════════════════════════════

def _camel_to_member_row(d: dict) -> dict:
    return {
        'id':              d.get('id'),
        'name':            d.get('name'),
        'phone':           d.get('phone', ''),
        'level':           d.get('level'),
        'points':          d.get('points', 0),
        'discount':        d.get('discount', 1),
        'balance':         d.get('balance', 0),
        'join_date':       d.get('joinDate'),
        'join_amount':     d.get('joinAmount', 0),
        'join_sub_type':   d.get('joinSubType'),
        'last_renew_date': d.get('lastRenewDate'),
        'renew_status':    d.get('renewStatus'),
    }


@app.route('/api/members', methods=['GET'])
def get_members():
    conn = get_db()
    try:
        rows = conn.execute("SELECT * FROM members").fetchall()
        return jsonify([member_to_camel(dict(r)) for r in rows])
    finally:
        conn.close()


@app.route('/api/members', methods=['POST'])
def create_member():
    data = request.get_json()
    row = _camel_to_member_row(data)
    cols = tuple(row.keys())
    ph = ','.join(['?'] * len(cols))
    conn = get_db()
    try:
        conn.execute(
            f"INSERT OR REPLACE INTO members ({','.join(cols)}) VALUES ({ph})",
            list(row.values())
        )
        conn.commit()
        return jsonify({'ok': True, 'id': row['id']}), 201
    finally:
        conn.close()


@app.route('/api/members/<member_id>', methods=['PATCH'])
def update_member(member_id):
    data = request.get_json()
    row = _camel_to_member_row(data)
    cols = tuple(row.keys())
    set_clause = ', '.join(f"{k}=?" for k in cols if k != 'id')
    vals = [row[k] for k in cols if k != 'id'] + [member_id]
    conn = get_db()
    try:
        conn.execute(f"UPDATE members SET {set_clause} WHERE id=?", vals)
        conn.commit()
        return jsonify({'ok': True})
    finally:
        conn.close()


@app.route('/api/members/<member_id>', methods=['DELETE'])
def delete_member(member_id):
    conn = get_db()
    try:
        conn.execute("DELETE FROM members WHERE id=?", (member_id,))
        conn.commit()
        return jsonify({'ok': True})
    finally:
        conn.close()


# ══════════════════════════════════════════════════════════════════
# Transactions
# ══════════════════════════════════════════════════════════════════

def _camel_to_transaction_row(d: dict) -> dict:
    return {
        'id':           d.get('id'),
        'date':         d.get('date'),
        'type':         d.get('type'),
        'sub_type':     d.get('subType'),
        'amount':       d.get('amount', 0),
        'payment_type': d.get('paymentType', 'cash'),
        'member_id':    d.get('memberId'),
        'member_name':  d.get('memberName'),
        'remark':       d.get('remark', ''),
        'operator':     d.get('operator'),
        'operator_id':  d.get('operatorId'),
    }


@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    conn = get_db()
    try:
        rows = conn.execute("SELECT * FROM transactions ORDER BY date DESC").fetchall()
        return jsonify([transaction_to_camel(dict(r)) for r in rows])
    finally:
        conn.close()


@app.route('/api/transactions', methods=['POST'])
def create_transaction():
    data = request.get_json()
    row = _camel_to_transaction_row(data)
    cols = tuple(row.keys())
    ph = ','.join(['?'] * len(cols))
    conn = get_db()
    try:
        conn.execute(
            f"INSERT OR REPLACE INTO transactions ({','.join(cols)}) VALUES ({ph})",
            list(row.values())
        )
        conn.commit()
        return jsonify({'ok': True}), 201
    finally:
        conn.close()


@app.route('/api/transactions/<tx_id>', methods=['PATCH'])
def update_transaction(tx_id):
    data = request.get_json()
    row = _camel_to_transaction_row(data)
    cols = tuple(row.keys())
    set_clause = ', '.join(f"{k}=?" for k in cols if k != 'id')
    vals = [row[k] for k in cols if k != 'id'] + [tx_id]
    conn = get_db()
    try:
        conn.execute(f"UPDATE transactions SET {set_clause} WHERE id=?", vals)
        conn.commit()
        return jsonify({'ok': True})
    finally:
        conn.close()


# ══════════════════════════════════════════════════════════════════
# Blanket Records
# ══════════════════════════════════════════════════════════════════

def _camel_to_blanket_row(d: dict) -> dict:
    return {
        'id':                 d.get('id'),
        'member_id':          d.get('memberId'),
        'member_name':        d.get('memberName'),
        'date':               d.get('date'),
        'next_reminder_date': d.get('nextReminderDate'),
        'remark':             d.get('remark', ''),
    }


@app.route('/api/blanket_records', methods=['GET'])
def get_blanket_records():
    conn = get_db()
    try:
        rows = conn.execute("SELECT * FROM blanket_records").fetchall()
        return jsonify([blanket_to_camel(dict(r)) for r in rows])
    finally:
        conn.close()


@app.route('/api/blanket_records', methods=['POST'])
def create_blanket_record():
    data = request.get_json()
    row = _camel_to_blanket_row(data)
    cols = tuple(row.keys())
    ph = ','.join(['?'] * len(cols))
    conn = get_db()
    try:
        conn.execute(
            f"INSERT OR REPLACE INTO blanket_records ({','.join(cols)}) VALUES ({ph})",
            list(row.values())
        )
        conn.commit()
        return jsonify({'ok': True}), 201
    finally:
        conn.close()


@app.route('/api/blanket_records/<record_id>', methods=['PATCH'])
def update_blanket_record(record_id):
    data = request.get_json()
    row = _camel_to_blanket_row(data)
    cols = tuple(row.keys())
    set_clause = ', '.join(f"{k}=?" for k in cols if k != 'id')
    vals = [row[k] for k in cols if k != 'id'] + [record_id]
    conn = get_db()
    try:
        conn.execute(f"UPDATE blanket_records SET {set_clause} WHERE id=?", vals)
        conn.commit()
        return jsonify({'ok': True})
    finally:
        conn.close()


@app.route('/api/blanket_records/<record_id>', methods=['DELETE'])
def delete_blanket_record(record_id):
    conn = get_db()
    try:
        conn.execute("DELETE FROM blanket_records WHERE id=?", (record_id,))
        conn.commit()
        return jsonify({'ok': True})
    finally:
        conn.close()


# ══════════════════════════════════════════════════════════════════
# Products
# ══════════════════════════════════════════════════════════════════

@app.route('/api/products', methods=['GET'])
def get_products():
    conn = get_db()
    try:
        rows = conn.execute("SELECT * FROM products").fetchall()
        result = []
        for r in rows:
            d = dict(r)
            d['isBlanket'] = bool(d.pop('is_blanket', 0))
            result.append(d)
        return jsonify(result)
    finally:
        conn.close()


@app.route('/api/products', methods=['POST'])
def create_product():
    data = request.get_json()
    conn = get_db()
    try:
        conn.execute(
            "INSERT OR REPLACE INTO products (id,name,price,category,unit,is_blanket) VALUES (?,?,?,?,?,?)",
            (data['id'], data['name'], data['price'], data.get('category',''),
             data.get('unit','件'), 1 if data.get('isBlanket') else 0)
        )
        conn.commit()
        return jsonify({'ok': True}), 201
    finally:
        conn.close()


@app.route('/api/products/<product_id>', methods=['PATCH'])
def update_product(product_id):
    data = request.get_json()
    conn = get_db()
    try:
        conn.execute(
            "UPDATE products SET name=?,price=?,category=?,unit=?,is_blanket=? WHERE id=?",
            (data['name'], data['price'], data.get('category',''),
             data.get('unit','件'), 1 if data.get('isBlanket') else 0, product_id)
        )
        conn.commit()
        return jsonify({'ok': True})
    finally:
        conn.close()


@app.route('/api/products/<product_id>', methods=['DELETE'])
def delete_product(product_id):
    conn = get_db()
    try:
        conn.execute("DELETE FROM products WHERE id=?", (product_id,))
        conn.commit()
        return jsonify({'ok': True})
    finally:
        conn.close()


# ══════════════════════════════════════════════════════════════════
# Addons
# ══════════════════════════════════════════════════════════════════

@app.route('/api/addons', methods=['GET'])
def get_addons():
    conn = get_db()
    try:
        return jsonify(rows_to_list(conn.execute("SELECT * FROM addons").fetchall()))
    finally:
        conn.close()


@app.route('/api/addons', methods=['POST'])
def create_addon():
    data = request.get_json()
    conn = get_db()
    try:
        conn.execute(
            "INSERT OR REPLACE INTO addons (id,name,price) VALUES (?,?,?)",
            (data['id'], data['name'], data['price'])
        )
        conn.commit()
        return jsonify({'ok': True}), 201
    finally:
        conn.close()


@app.route('/api/addons/<addon_id>', methods=['PATCH'])
def update_addon(addon_id):
    data = request.get_json()
    conn = get_db()
    try:
        conn.execute(
            "UPDATE addons SET name=?,price=? WHERE id=?",
            (data['name'], data['price'], addon_id)
        )
        conn.commit()
        return jsonify({'ok': True})
    finally:
        conn.close()


@app.route('/api/addons/<addon_id>', methods=['DELETE'])
def delete_addon(addon_id):
    conn = get_db()
    try:
        conn.execute("DELETE FROM addons WHERE id=?", (addon_id,))
        conn.commit()
        return jsonify({'ok': True})
    finally:
        conn.close()


# ══════════════════════════════════════════════════════════════════
# Zones
# ══════════════════════════════════════════════════════════════════

@app.route('/api/zones', methods=['GET'])
def get_zones():
    conn = get_db()
    try:
        return jsonify([r['name'] for r in conn.execute("SELECT name FROM zones").fetchall()])
    finally:
        conn.close()


@app.route('/api/zones', methods=['PUT'])
def update_zones():
    """Replace the entire zones list."""
    zones = request.get_json()  # expects a list of strings
    conn = get_db()
    try:
        conn.execute("DELETE FROM zones")
        conn.executemany("INSERT INTO zones VALUES (?)", [(z,) for z in zones])
        conn.commit()
        return jsonify({'ok': True})
    finally:
        conn.close()


# ══════════════════════════════════════════════════════════════════
# Employees
# ══════════════════════════════════════════════════════════════════

@app.route('/api/employees', methods=['GET'])
def get_employees():
    conn = get_db()
    try:
        return jsonify(rows_to_list(conn.execute(
            "SELECT id, username, nickname, role FROM employees").fetchall()))
    finally:
        conn.close()


@app.route('/api/employees', methods=['POST'])
def create_employee():
    data = request.get_json()
    conn = get_db()
    try:
        conn.execute(
            "INSERT OR REPLACE INTO employees (id,username,password,nickname,role) VALUES (?,?,?,?,?)",
            (data['id'], data['username'], data['password'], data['nickname'], data.get('role','staff'))
        )
        conn.commit()
        return jsonify({'ok': True}), 201
    finally:
        conn.close()


@app.route('/api/employees/<emp_id>', methods=['PATCH'])
def update_employee(emp_id):
    data = request.get_json()
    fields = ['username', 'nickname', 'role']
    if 'password' in data and data['password']:
        fields.append('password')
    set_clause = ', '.join(f"{f}=?" for f in fields)
    vals = [data[f] for f in fields] + [emp_id]
    conn = get_db()
    try:
        conn.execute(f"UPDATE employees SET {set_clause} WHERE id=?", vals)
        conn.commit()
        return jsonify({'ok': True})
    finally:
        conn.close()


@app.route('/api/employees/<emp_id>', methods=['DELETE'])
def delete_employee(emp_id):
    conn = get_db()
    try:
        conn.execute("DELETE FROM employees WHERE id=?", (emp_id,))
        conn.commit()
        return jsonify({'ok': True})
    finally:
        conn.close()


# ══════════════════════════════════════════════════════════════════
# Settings
# ══════════════════════════════════════════════════════════════════

@app.route('/api/settings', methods=['GET'])
def get_settings():
    conn = get_db()
    try:
        rows = conn.execute("SELECT key, value FROM app_state").fetchall()
        settings = {r['key']: r['value'] for r in rows}
        try:
            settings['memberSettings'] = json.loads(settings.get('memberSettings', '{}'))
        except Exception:
            pass
        return jsonify(settings)
    finally:
        conn.close()


@app.route('/api/settings', methods=['PATCH'])
def update_settings():
    """Update one or more settings keys."""
    data = request.get_json()
    conn = get_db()
    try:
        for key, value in data.items():
            if isinstance(value, (dict, list)):
                value = json.dumps(value, ensure_ascii=False)
            else:
                value = str(value)
            conn.execute(
                "INSERT OR REPLACE INTO app_state (key,value) VALUES (?,?)",
                (key, value)
            )
        conn.commit()
        return jsonify({'ok': True})
    finally:
        conn.close()


# ══════════════════════════════════════════════════════════════════
# Entry point
# ══════════════════════════════════════════════════════════════════

if __name__ == '__main__':
    init_db()
    print("✅ 資料庫初始化完成")
    print("🚀 啟動伺服器 → http://127.0.0.1:5000")
    app.run(debug=True, host='127.0.0.1', port=5000)
