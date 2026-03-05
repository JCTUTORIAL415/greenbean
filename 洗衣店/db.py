"""
Database initialization and helper functions for 洗衣店 POS System.
Uses SQLite for persistent storage.
"""
import sqlite3
import json
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'laundry.db')


def get_db():
    """Get a database connection with row_factory for dict-like access."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db():
    """Create all tables if they don't exist and seed initial data."""
    conn = get_db()
    try:
        _create_tables(conn)
        _seed_data(conn)
        conn.commit()
    finally:
        conn.close()


def _create_tables(conn):
    conn.executescript("""
        -- Key-value settings store (shop name, phone, counters, etc.)
        CREATE TABLE IF NOT EXISTS app_state (
            key   TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );

        -- Employees
        CREATE TABLE IF NOT EXISTS employees (
            id       TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            nickname TEXT NOT NULL,
            role     TEXT NOT NULL DEFAULT 'staff'
        );

        -- Members
        CREATE TABLE IF NOT EXISTS members (
            id              TEXT PRIMARY KEY,
            name            TEXT NOT NULL,
            phone           TEXT,
            level           TEXT NOT NULL,
            points          INTEGER DEFAULT 0,
            discount        REAL DEFAULT 1,
            balance         REAL DEFAULT 0,
            join_date       TEXT,
            join_amount     REAL DEFAULT 0,
            join_sub_type   TEXT,
            last_renew_date TEXT,
            renew_status    TEXT
        );

        -- Orders (items stored as JSON)
        CREATE TABLE IF NOT EXISTS orders (
            id                  TEXT PRIMARY KEY,
            order_num           TEXT,
            type                TEXT,
            status              TEXT,
            customer_name       TEXT,
            phone               TEXT,
            member_id           TEXT,
            total               REAL DEFAULT 0,
            orig_total          REAL DEFAULT 0,
            discount            REAL DEFAULT 1,
            date                TEXT,
            pickup_date         TEXT,
            zone                TEXT,
            blanket_count       INTEGER DEFAULT 0,
            remark              TEXT,
            done_date           TEXT,
            done_by             TEXT,
            return_date         TEXT,
            returned_by         TEXT,
            collected_date      TEXT,
            collected_by        TEXT,
            paid_amount         REAL DEFAULT 0,
            payment_type        TEXT,
            member_balance_used REAL DEFAULT 0,
            last_operator       TEXT,
            items               TEXT DEFAULT '[]'
        );

        -- Transactions (membership fees, deposits, balance adjustments)
        CREATE TABLE IF NOT EXISTS transactions (
            id          TEXT PRIMARY KEY,
            date        TEXT,
            type        TEXT,
            sub_type    TEXT,
            amount      REAL,
            payment_type TEXT,
            member_id   TEXT,
            member_name TEXT,
            remark      TEXT,
            operator    TEXT,
            operator_id TEXT
        );

        -- Blanket cleaning reminder records
        CREATE TABLE IF NOT EXISTS blanket_records (
            id                 TEXT PRIMARY KEY,
            member_id          TEXT,
            member_name        TEXT,
            date               TEXT,
            next_reminder_date TEXT,
            remark             TEXT
        );

        -- Products catalog
        CREATE TABLE IF NOT EXISTS products (
            id         TEXT PRIMARY KEY,
            name       TEXT NOT NULL,
            price      REAL NOT NULL,
            category   TEXT,
            unit       TEXT,
            is_blanket INTEGER DEFAULT 0
        );

        -- Addons catalog
        CREATE TABLE IF NOT EXISTS addons (
            id    TEXT PRIMARY KEY,
            name  TEXT NOT NULL,
            price REAL NOT NULL
        );

        -- Zones (pickup location names)
        CREATE TABLE IF NOT EXISTS zones (
            name TEXT PRIMARY KEY
        );
    """)


def _seed_data(conn):
    """Insert initial data only if tables are empty."""
    from datetime import date, timedelta

    def today():
        return date.today().isoformat()

    def add_days(n):
        return (date.today() + timedelta(days=n)).isoformat()

    # ── App state / settings ──────────────────────────────────────
    existing = conn.execute("SELECT COUNT(*) FROM app_state").fetchone()[0]
    if existing == 0:
        state_rows = [
            ('shopName', '清潔美洗衣坊'),
            ('shopPhone', '02-2345-6789'),
            ('shopNote', '取件時請攜帶本收據，逾期未取酌收保管費。如有問題請來電洽詢。'),
            ('dailyCounter', '8'),
            ('sCounter', '10'),
            ('pCounter', '6'),
            ('lastDailyDate', today()),
            ('blanketReminderMonths', '2'),
            ('memberSettings', json.dumps({
                'gold':    {'minBalance': 3000, 'discount': 0.8},
                'silver':  {'minBalance': 1000, 'discount': 0.9},
                'special': {'minBalance': 0,    'discount': 0.75}
            })),
        ]
        conn.executemany("INSERT OR IGNORE INTO app_state VALUES (?,?)", state_rows)

    # ── Employees ─────────────────────────────────────────────────
    existing = conn.execute("SELECT COUNT(*) FROM employees").fetchone()[0]
    if existing == 0:
        conn.executemany(
            "INSERT OR IGNORE INTO employees VALUES (?,?,?,?,?)",
            [
                ('EMP001', 'admin',  '123', '店長', 'admin'),
                ('EMP002', 'staff1', '123', '小美', 'staff'),
                ('EMP003', 'staff2', '123', '阿強', 'staff'),
            ]
        )

    # ── Zones ─────────────────────────────────────────────────────
    existing = conn.execute("SELECT COUNT(*) FROM zones").fetchone()[0]
    if existing == 0:
        zones = ['A-1','A-2','A-3','B-1','B-2','B-3','C-1','C-2','C-3','D-1','D-2','D-3']
        conn.executemany("INSERT OR IGNORE INTO zones VALUES (?)", [(z,) for z in zones])

    # ── Products ──────────────────────────────────────────────────
    existing = conn.execute("SELECT COUNT(*) FROM products").fetchone()[0]
    if existing == 0:
        products = [
            ('PRD01','大衣',350,'professional','件',0),
            ('PRD02','西裝外套',280,'professional','件',0),
            ('PRD03','棉被（單人）',450,'professional','件',1),
            ('PRD04','棉被（雙人）',600,'professional','件',1),
            ('PRD05','羽絨服',320,'professional','件',0),
            ('PRD06','西裝褲',180,'professional','件',0),
            ('PRD07','裙子',160,'professional','件',0),
            ('PRD08','上衣/T恤',150,'professional','件',0),
            ('PRD09','現場洗',80,'walkin','籃',0),
            ('PRD10','現場烘',60,'walkin','籃',0),
            ('PRD11','純洗',80,'wash','籃',0),
            ('PRD12','純烘',60,'dry','籃',0),
            ('PRD13','純燙',100,'iron','件',0),
        ]
        conn.executemany(
            "INSERT OR IGNORE INTO products VALUES (?,?,?,?,?,?)", products
        )

    # ── Addons ────────────────────────────────────────────────────
    existing = conn.execute("SELECT COUNT(*) FROM addons").fetchone()[0]
    if existing == 0:
        addons = [
            ('ADD01','低溫烘多次',50),
            ('ADD02','裝衣袋',20),
            ('ADD03','去漬加工',80),
            ('ADD04','補縫加工',60),
            ('ADD05','特殊洗劑',40),
            ('ADD06','急件加收',100),
            ('ADD07','折包服務',30),
        ]
        conn.executemany("INSERT OR IGNORE INTO addons VALUES (?,?,?)", addons)

    # ── Members ───────────────────────────────────────────────────
    existing = conn.execute("SELECT COUNT(*) FROM members").fetchone()[0]
    if existing == 0:
        members = [
            ('001','陳小明','0912345678','gold',120,0.8,3500,'2026-01-01',3000,'full','2026-01-01','full'),
            ('002','林美玲','0933111222','silver',45,0.9,1500,'2026-01-15',1000,'installment1','2026-01-15','installment1'),
            ('003','王大華','0966777888','special',0,0.75,800,'2026-02-01',0,None,'2026-02-01',None),
            ('004','趙雅婷','0988123456','gold',280,0.8,5800,'2025-11-01',3000,'full','2026-01-10','full'),
            ('005','劉建國','0922667788','silver',95,0.9,2200,'2025-12-15',1000,'full','2025-12-15','full'),
            ('006','吳淑芬','0956334411','gold',310,0.8,1800,'2025-10-01',3000,'full','2026-02-01','full'),
            ('007','黃志豪','0911228833','special',15,0.72,500,'2026-02-15',0,None,'2026-02-15',None),
            ('008','蔡美珠','0944556677','silver',30,0.9,800,'2026-02-20',1000,'installment1','2026-02-20','installment1'),
        ]
        conn.executemany(
            "INSERT OR IGNORE INTO members VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", members
        )

    # ── Transactions ──────────────────────────────────────────────
    existing = conn.execute("SELECT COUNT(*) FROM transactions").fetchone()[0]
    if existing == 0:
        transactions = [
            ('TR001','2026-01-01','membership_join','full',3000,'cash','001','陳小明','入會(金卡)一次繳清',None,None),
            ('TR002','2026-01-15','membership_join','installment1',1000,'cash','002','林美玲','入會1(銀卡訂金)',None,None),
            ('TR003','2026-02-01','membership_join','full',0,'cash','003','王大華','特殊客戶登記',None,None),
            ('TR004','2025-11-01','membership_join','full',3000,'cash','004','趙雅婷','入會(金卡)',None,None),
            ('TR005','2025-12-15','membership_join','full',1000,'cash','005','劉建國','入會(銀卡)',None,None),
            ('TR006','2025-10-01','membership_join','full',3000,'cash','006','吳淑芬','入會(金卡)',None,None),
            ('TR007','2026-02-15','membership_join','full',0,'cash','007','黃志豪','特殊客戶登記',None,None),
            ('TR008','2026-02-20','membership_join','installment1',500,'cash','008','蔡美珠','入會1(銀卡訂金)',None,None),
            ('TR009','2026-01-10','membership_renew','full',3000,'cash','004','趙雅婷','續會(一次)2026年',None,None),
            ('TR010','2026-02-01','membership_renew','full',3000,'cash','006','吳淑芬','續會(一次)2026年',None,None),
            ('TR011', add_days(-5),'deposit',None,500,'cash','002','林美玲','補訂金(入會2)',None,None),
            ('TR012', add_days(-3),'balance_adjust',None,500,'system','001','陳小明','年節優惠補贈儲值金','店長','EMP001'),
            ('TR013', add_days(-1),'balance_adjust',None,-200,'system','006','吳淑芬','退款扣減（誤收）','小美','EMP002'),
        ]
        conn.executemany(
            "INSERT OR IGNORE INTO transactions VALUES (?,?,?,?,?,?,?,?,?,?,?)", transactions
        )

    # ── Blanket records ───────────────────────────────────────────
    existing = conn.execute("SELECT COUNT(*) FROM blanket_records").fetchone()[0]
    if existing == 0:
        blanket_records = [
            ('BR001','004','趙雅婷', add_days(-58), add_days(2),  '雙人加大棉被'),
            ('BR002','002','林美玲', add_days(-55), add_days(5),  '單人棉被'),
            ('BR003','003','王大華', add_days(-90), add_days(-30),'雙人棉被'),
            ('BR004','001','陳小明', add_days(-30), add_days(30), '單人棉被'),
            ('BR005','006','吳淑芬', add_days(-50), add_days(10), '雙人棉被'),
        ]
        conn.executemany(
            "INSERT OR IGNORE INTO blanket_records VALUES (?,?,?,?,?,?)", blanket_records
        )

    # ── Orders ────────────────────────────────────────────────────
    existing = conn.execute("SELECT COUNT(*) FROM orders").fetchone()[0]
    if existing == 0:
        t = today()
        orders = [
            # walkin
            {
                'id':'ORD001','order_num':'1','type':'walkin','status':'collected',
                'customer_name':'散客','phone':'','member_id':None,
                'total':160,'orig_total':160,'discount':1,'date':t,'pickup_date':t,
                'zone':'','blanket_count':0,'remark':'',
                'done_date':None,'done_by':None,'return_date':None,'returned_by':None,
                'collected_date':t+' 09:00','collected_by':'阿強',
                'paid_amount':160,'payment_type':'cash','member_balance_used':0,
                'last_operator':'阿強',
                'items':json.dumps([{'name':'現場洗','price':80,'qty':2,'addons':[],'isBlanket':False,'remark':''}])
            },
            {
                'id':'ORD002','order_num':'2','type':'walkin','status':'collected',
                'customer_name':'趙雅婷','phone':'0988123456','member_id':'004',
                'total':224,'orig_total':280,'discount':0.8,'date':t,'pickup_date':t,
                'zone':'','blanket_count':0,'remark':'',
                'done_date':None,'done_by':None,'return_date':None,'returned_by':None,
                'collected_date':t+' 09:30','collected_by':'店長',
                'paid_amount':224,'payment_type':'member','member_balance_used':224,
                'last_operator':'店長',
                'items':json.dumps([
                    {'name':'現場洗','price':80,'qty':2,'addons':[],'isBlanket':False,'remark':''},
                    {'name':'現場烘','price':60,'qty':2,'addons':[],'isBlanket':False,'remark':''}
                ])
            },
            {
                'id':'ORD003','order_num':'3','type':'walkin','status':'collected',
                'customer_name':'散客','phone':'0977443322','member_id':None,
                'total':140,'orig_total':140,'discount':1,'date':t,'pickup_date':t,
                'zone':'','blanket_count':0,'remark':'',
                'done_date':None,'done_by':None,'return_date':None,'returned_by':None,
                'collected_date':t+' 10:00','collected_by':'小美',
                'paid_amount':140,'payment_type':'cash','member_balance_used':0,
                'last_operator':'小美',
                'items':json.dumps([
                    {'name':'現場洗','price':80,'qty':1,'addons':[],'isBlanket':False,'remark':''},
                    {'name':'現場烘','price':60,'qty':1,'addons':[],'isBlanket':False,'remark':''}
                ])
            },
            {
                'id':'ORD004','order_num':'4','type':'walkin','status':'done',
                'customer_name':'陳小明','phone':'0912345678','member_id':'001',
                'total':192,'orig_total':240,'discount':0.8,'date':t,'pickup_date':t,
                'zone':'','blanket_count':0,'remark':'',
                'done_date':t+' 10:30','done_by':'店長','return_date':None,'returned_by':None,
                'collected_date':None,'collected_by':None,
                'paid_amount':192,'payment_type':'member','member_balance_used':192,
                'last_operator':'店長',
                'items':json.dumps([{'name':'現場洗','price':80,'qty':3,'addons':[],'isBlanket':False,'remark':''}])
            },
            {
                'id':'ORD005','order_num':'5','type':'walkin','status':'done',
                'customer_name':'散客','phone':'','member_id':None,
                'total':220,'orig_total':220,'discount':1,'date':t,'pickup_date':t,
                'zone':'','blanket_count':0,'remark':'',
                'done_date':t+' 11:00','done_by':'小美','return_date':None,'returned_by':None,
                'collected_date':None,'collected_by':None,
                'paid_amount':220,'payment_type':'cash','member_balance_used':0,
                'last_operator':'小美',
                'items':json.dumps([
                    {'name':'現場洗','price':80,'qty':2,'addons':[],'isBlanket':False,'remark':''},
                    {'name':'現場烘','price':60,'qty':1,'addons':[],'isBlanket':False,'remark':''}
                ])
            },
            {
                'id':'ORD006','order_num':'6','type':'walkin','status':'pending',
                'customer_name':'林美玲','phone':'0933111222','member_id':'002',
                'total':144,'orig_total':160,'discount':0.9,'date':t,'pickup_date':t,
                'zone':'','blanket_count':0,'remark':'',
                'done_date':None,'done_by':None,'return_date':None,'returned_by':None,
                'collected_date':None,'collected_by':None,
                'paid_amount':144,'payment_type':'member','member_balance_used':144,
                'last_operator':'阿強',
                'items':json.dumps([{'name':'現場洗','price':80,'qty':2,'addons':[],'isBlanket':False,'remark':''}])
            },
            {
                'id':'ORD007','order_num':'7','type':'walkin','status':'pending',
                'customer_name':'散客','phone':'0955443322','member_id':None,
                'total':240,'orig_total':240,'discount':1,'date':t,'pickup_date':t,
                'zone':'','blanket_count':0,'remark':'大包',
                'done_date':None,'done_by':None,'return_date':None,'returned_by':None,
                'collected_date':None,'collected_by':None,
                'paid_amount':240,'payment_type':'cash','member_balance_used':0,
                'last_operator':'阿強',
                'items':json.dumps([{'name':'現場洗','price':80,'qty':3,'addons':[],'isBlanket':False,'remark':'大包衣物'}])
            },
            {
                'id':'ORD008','order_num':'8','type':'walkin','status':'pending',
                'customer_name':'王大華','phone':'0966777888','member_id':'003',
                'total':210,'orig_total':280,'discount':0.75,'date':t,'pickup_date':t,
                'zone':'','blanket_count':0,'remark':'',
                'done_date':None,'done_by':None,'return_date':None,'returned_by':None,
                'collected_date':None,'collected_by':None,
                'paid_amount':210,'payment_type':'cash','member_balance_used':0,
                'last_operator':'店長',
                'items':json.dumps([
                    {'name':'現場洗','price':80,'qty':2,'addons':[],'isBlanket':False,'remark':''},
                    {'name':'現場烘','price':60,'qty':2,'addons':[],'isBlanket':False,'remark':''}
                ])
            },
            # store S0001~S0010
            {
                'id':'ORD009','order_num':'S0001','type':'store','status':'collected',
                'customer_name':'陳小明','phone':'0912345678','member_id':'001',
                'total':424,'orig_total':530,'discount':0.8,'date':t,'pickup_date':t,
                'zone':'A-1','blanket_count':0,'remark':'',
                'done_date':t+' 08:00','done_by':'店長','return_date':None,'returned_by':None,
                'collected_date':t+' 09:30','collected_by':'店長',
                'paid_amount':424,'payment_type':'member','member_balance_used':424,
                'last_operator':'店長',
                'items':json.dumps([
                    {'name':'大衣','price':350,'qty':1,'addons':[],'isBlanket':False,'remark':''},
                    {'name':'西裝褲','price':180,'qty':1,'addons':[],'isBlanket':False,'remark':''}
                ])
            },
            {
                'id':'ORD010','order_num':'S0002','type':'store','status':'collected',
                'customer_name':'吳淑芬','phone':'0956334411','member_id':'006',
                'total':480,'orig_total':600,'discount':0.8,'date':t,'pickup_date':t,
                'zone':'A-3','blanket_count':0,'remark':'左袖去漬',
                'done_date':t+' 08:30','done_by':'小美','return_date':None,'returned_by':None,
                'collected_date':t+' 10:00','collected_by':'阿強',
                'paid_amount':480,'payment_type':'member','member_balance_used':480,
                'last_operator':'阿強',
                'items':json.dumps([
                    {'name':'西裝外套','price':280,'qty':1,'addons':[],'isBlanket':False,'remark':'左袖污漬'},
                    {'name':'裙子','price':160,'qty':2,'addons':[],'isBlanket':False,'remark':''}
                ])
            },
            {
                'id':'ORD011','order_num':'S0003','type':'store','status':'done',
                'customer_name':'散客 張先生','phone':'0933445566','member_id':None,
                'total':620,'orig_total':620,'discount':1,'date':t,'pickup_date': add_days(1),
                'zone':'B-1','blanket_count':0,'remark':'',
                'done_date':t+' 11:00','done_by':'店長','return_date':None,'returned_by':None,
                'collected_date':None,'collected_by':None,
                'paid_amount':620,'payment_type':'cash','member_balance_used':0,
                'last_operator':'店長',
                'items':json.dumps([
                    {'name':'羽絨服','price':320,'qty':1,'addons':[],'isBlanket':False,'remark':''},
                    {'name':'上衣/T恤','price':150,'qty':2,'addons':[],'isBlanket':False,'remark':''}
                ])
            },
            {
                'id':'ORD012','order_num':'S0004','type':'store','status':'done',
                'customer_name':'趙雅婷','phone':'0988123456','member_id':'004',
                'total':560,'orig_total':700,'discount':0.8,'date':t,'pickup_date': add_days(2),
                'zone':'A-2','blanket_count':0,'remark':'羊毛大衣 低溫處理',
                'done_date':t+' 11:30','done_by':'小美','return_date':None,'returned_by':None,
                'collected_date':None,'collected_by':None,
                'paid_amount':560,'payment_type':'member','member_balance_used':560,
                'last_operator':'小美',
                'items':json.dumps([
                    {'name':'大衣','price':350,'qty':2,'addons':[],'isBlanket':False,'remark':'羊毛 請低溫'}
                ])
            },
            {
                'id':'ORD013','order_num':'S0005','type':'store','status':'pending',
                'customer_name':'劉建國','phone':'0922667788','member_id':'005',
                'total':414,'orig_total':460,'discount':0.9,'date':t,'pickup_date': add_days(3),
                'zone':'B-2','blanket_count':0,'remark':'',
                'done_date':None,'done_by':None,'return_date':None,'returned_by':None,
                'collected_date':None,'collected_by':None,
                'paid_amount':414,'payment_type':'member','member_balance_used':414,
                'last_operator':'阿強',
                'items':json.dumps([
                    {'name':'西裝外套','price':280,'qty':1,'addons':[],'isBlanket':False,'remark':''},
                    {'name':'西裝褲','price':180,'qty':1,'addons':[],'isBlanket':False,'remark':''}
                ])
            },
            {
                'id':'ORD014','order_num':'S0006','type':'store','status':'pending',
                'customer_name':'散客 李小姐','phone':'0922334455','member_id':None,
                'total':280,'orig_total':280,'discount':1,'date':t,'pickup_date': add_days(4),
                'zone':'A-4','blanket_count':0,'remark':'',
                'done_date':None,'done_by':None,'return_date':None,'returned_by':None,
                'collected_date':None,'collected_by':None,
                'paid_amount':280,'payment_type':'cash','member_balance_used':0,
                'last_operator':'小美',
                'items':json.dumps([
                    {'name':'西裝外套','price':280,'qty':1,'addons':[],'isBlanket':False,'remark':''}
                ])
            },
            {
                'id':'ORD015','order_num':'S0007','type':'store','status':'pending',
                'customer_name':'林美玲','phone':'0933111222','member_id':'002',
                'total':459,'orig_total':510,'discount':0.9,'date':t,'pickup_date': add_days(3),
                'zone':'C-1','blanket_count':0,'remark':'',
                'done_date':None,'done_by':None,'return_date':None,'returned_by':None,
                'collected_date':None,'collected_by':None,
                'paid_amount':459,'payment_type':'member','member_balance_used':459,
                'last_operator':'店長',
                'items':json.dumps([
                    {'name':'大衣','price':350,'qty':1,'addons':[],'isBlanket':False,'remark':''},
                    {'name':'裙子','price':160,'qty':1,'addons':[],'isBlanket':False,'remark':''}
                ])
            },
            {
                'id':'ORD016','order_num':'S0008','type':'store','status':'pending',
                'customer_name':'蔡美珠','phone':'0944556677','member_id':'008',
                'total':405,'orig_total':450,'discount':0.9,'date':t,'pickup_date': add_days(5),
                'zone':'D-1','blanket_count':1,'remark':'羽毛被',
                'done_date':None,'done_by':None,'return_date':None,'returned_by':None,
                'collected_date':None,'collected_by':None,
                'paid_amount':405,'payment_type':'member','member_balance_used':405,
                'last_operator':'阿強',
                'items':json.dumps([
                    {'name':'棉被（單人）','price':450,'qty':1,'addons':[],'isBlanket':True,'remark':'羽毛被'}
                ])
            },
            {
                'id':'ORD017','order_num':'S0009','type':'store','status':'unpaid',
                'customer_name':'散客 黃先生','phone':'0933998877','member_id':None,
                'total':350,'orig_total':350,'discount':1,'date':t,'pickup_date': add_days(4),
                'zone':'B-3','blanket_count':0,'remark':'客人稱下次取件再付',
                'done_date':None,'done_by':None,'return_date':None,'returned_by':None,
                'collected_date':None,'collected_by':None,
                'paid_amount':0,'payment_type':'cash','member_balance_used':0,
                'last_operator':'小美',
                'items':json.dumps([
                    {'name':'大衣','price':350,'qty':1,'addons':[],'isBlanket':False,'remark':''}
                ])
            },
            {
                'id':'ORD018','order_num':'S0010','type':'store','status':'pending',
                'customer_name':'王大華','phone':'0966777888','member_id':'003',
                'total':465,'orig_total':620,'discount':0.75,'date':t,'pickup_date': add_days(3),
                'zone':'C-2','blanket_count':0,'remark':'',
                'done_date':None,'done_by':None,'return_date':None,'returned_by':None,
                'collected_date':None,'collected_by':None,
                'paid_amount':465,'payment_type':'cash','member_balance_used':0,
                'last_operator':'店長',
                'items':json.dumps([
                    {'name':'羽絨服','price':320,'qty':1,'addons':[],'isBlanket':False,'remark':''},
                    {'name':'上衣/T恤','price':150,'qty':2,'addons':[],'isBlanket':False,'remark':''}
                ])
            },
            # outsource P0001~P0006
            {
                'id':'ORD019','order_num':'P0001','type':'outsource','status':'collected',
                'customer_name':'趙雅婷','phone':'0988123456','member_id':'004',
                'total':840,'orig_total':1050,'discount':0.8,'date':t,'pickup_date':t,
                'zone':'D-2','blanket_count':2,'remark':'',
                'done_date':t+' 07:30','done_by':'店長',
                'return_date':t+' 08:30','returned_by':'阿強',
                'collected_date':t+' 09:00','collected_by':'小美',
                'paid_amount':840,'payment_type':'member','member_balance_used':840,
                'last_operator':'小美',
                'items':json.dumps([
                    {'name':'棉被（雙人）','price':600,'qty':1,'addons':[],'isBlanket':True,'remark':''},
                    {'name':'棉被（單人）','price':450,'qty':1,'addons':[],'isBlanket':True,'remark':''}
                ])
            },
            {
                'id':'ORD020','order_num':'P0002','type':'outsource','status':'returned',
                'customer_name':'陳小明','phone':'0912345678','member_id':'001',
                'total':280,'orig_total':350,'discount':0.8,'date':t,'pickup_date': add_days(1),
                'zone':'A-2','blanket_count':0,'remark':'袖口破損需補縫',
                'done_date':t+' 08:00','done_by':'小美',
                'return_date':t+' 10:00','returned_by':'阿強',
                'collected_date':None,'collected_by':None,
                'paid_amount':280,'payment_type':'member','member_balance_used':280,
                'last_operator':'阿強',
                'items':json.dumps([
                    {'name':'大衣','price':350,'qty':1,'addons':[],'isBlanket':False,'remark':'袖口破損補縫'}
                ])
            },
            {
                'id':'ORD021','order_num':'P0003','type':'outsource','status':'returned',
                'customer_name':'林美玲','phone':'0933111222','member_id':'002',
                'total':810,'orig_total':900,'discount':0.9,'date':t,'pickup_date': add_days(2),
                'zone':'B-2','blanket_count':2,'remark':'',
                'done_date':t+' 09:00','done_by':'店長',
                'return_date':t+' 10:30','returned_by':'店長',
                'collected_date':None,'collected_by':None,
                'paid_amount':810,'payment_type':'member','member_balance_used':810,
                'last_operator':'店長',
                'items':json.dumps([
                    {'name':'棉被（單人）','price':450,'qty':2,'addons':[],'isBlanket':True,'remark':''}
                ])
            },
            {
                'id':'ORD022','order_num':'P0004','type':'outsource','status':'done',
                'customer_name':'散客 吳先生','phone':'0955116622','member_id':None,
                'total':600,'orig_total':600,'discount':1,'date':t,'pickup_date': add_days(3),
                'zone':'C-3','blanket_count':1,'remark':'',
                'done_date':t+' 11:00','done_by':'小美','return_date':None,'returned_by':None,
                'collected_date':None,'collected_by':None,
                'paid_amount':600,'payment_type':'cash','member_balance_used':0,
                'last_operator':'小美',
                'items':json.dumps([
                    {'name':'棉被（雙人）','price':600,'qty':1,'addons':[],'isBlanket':True,'remark':''}
                ])
            },
            {
                'id':'ORD023','order_num':'P0005','type':'outsource','status':'pending',
                'customer_name':'吳淑芬','phone':'0956334411','member_id':'006',
                'total':760,'orig_total':950,'discount':0.8,'date':t,'pickup_date': add_days(5),
                'zone':'D-3','blanket_count':1,'remark':'記憶棉棉被+羊毛大衣',
                'done_date':None,'done_by':None,'return_date':None,'returned_by':None,
                'collected_date':None,'collected_by':None,
                'paid_amount':760,'payment_type':'member','member_balance_used':760,
                'last_operator':'店長',
                'items':json.dumps([
                    {'name':'棉被（雙人）','price':600,'qty':1,'addons':[],'isBlanket':True,'remark':''},
                    {'name':'大衣','price':350,'qty':1,'addons':[],'isBlanket':False,'remark':''}
                ])
            },
            {
                'id':'ORD024','order_num':'P0006','type':'outsource','status':'transferred',
                'customer_name':'劉建國','phone':'0922667788','member_id':'005',
                'total':0,'orig_total':350,'discount':0.9,'date':t,'pickup_date': add_days(4),
                'zone':'','blanket_count':0,'remark':'全件轉至S本 (全數轉單)',
                'done_date':None,'done_by':None,'return_date':None,'returned_by':None,
                'collected_date':None,'collected_by':None,
                'paid_amount':0,'payment_type':'cash','member_balance_used':0,
                'last_operator':'店長',
                'items':json.dumps([])
            },
        ]
        cols = ('id','order_num','type','status','customer_name','phone','member_id',
                'total','orig_total','discount','date','pickup_date','zone','blanket_count',
                'remark','done_date','done_by','return_date','returned_by','collected_date',
                'collected_by','paid_amount','payment_type','member_balance_used',
                'last_operator','items')
        ph = ','.join(['?'] * len(cols))
        for o in orders:
            conn.execute(
                f"INSERT OR IGNORE INTO orders ({','.join(cols)}) VALUES ({ph})",
                [o[c] for c in cols]
            )


def row_to_dict(row):
    """Convert sqlite3.Row to plain dict."""
    return dict(row)


def rows_to_list(rows):
    """Convert list of sqlite3.Row to list of dicts."""
    return [dict(r) for r in rows]


def order_to_camel(o: dict) -> dict:
    """Convert snake_case order dict to camelCase for frontend."""
    items = o.get('items', '[]')
    if isinstance(items, str):
        items = json.loads(items)
    return {
        'id': o['id'],
        'orderNum': o['order_num'],
        'type': o['type'],
        'status': o['status'],
        'customerName': o['customer_name'],
        'phone': o['phone'] or '',
        'memberId': o['member_id'],
        'total': o['total'],
        'origTotal': o['orig_total'],
        'discount': o['discount'],
        'date': o['date'],
        'pickupDate': o['pickup_date'],
        'zone': o['zone'] or '',
        'blanketCount': o['blanket_count'],
        'remark': o['remark'] or '',
        'doneDate': o['done_date'],
        'doneBy': o['done_by'],
        'returnDate': o['return_date'],
        'returnedBy': o['returned_by'],
        'collectedDate': o['collected_date'],
        'collectedBy': o['collected_by'],
        'paidAmount': o['paid_amount'],
        'paymentType': o['payment_type'],
        'memberBalanceUsed': o['member_balance_used'],
        'lastOperator': o['last_operator'],
        'items': items,
    }


def member_to_camel(m: dict) -> dict:
    """Convert snake_case member dict to camelCase."""
    return {
        'id': m['id'],
        'name': m['name'],
        'phone': m['phone'] or '',
        'level': m['level'],
        'points': m['points'],
        'discount': m['discount'],
        'balance': m['balance'],
        'joinDate': m['join_date'],
        'joinAmount': m['join_amount'],
        'joinSubType': m['join_sub_type'],
        'lastRenewDate': m['last_renew_date'],
        'renewStatus': m['renew_status'],
    }


def transaction_to_camel(t: dict) -> dict:
    """Convert snake_case transaction dict to camelCase."""
    return {
        'id': t['id'],
        'date': t['date'],
        'type': t['type'],
        'subType': t['sub_type'],
        'amount': t['amount'],
        'paymentType': t['payment_type'],
        'memberId': t['member_id'],
        'memberName': t['member_name'],
        'remark': t['remark'] or '',
        'operator': t['operator'],
        'operatorId': t['operator_id'],
    }


def blanket_to_camel(b: dict) -> dict:
    return {
        'id': b['id'],
        'memberId': b['member_id'],
        'memberName': b['member_name'],
        'date': b['date'],
        'nextReminderDate': b['next_reminder_date'],
        'remark': b['remark'] or '',
    }
