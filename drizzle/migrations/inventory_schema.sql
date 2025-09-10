-- 재고 관리를 위한 테이블들
-- 1. 재고 정보 테이블
CREATE TABLE IF NOT EXISTS inventory (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'INV-' || UPPER(SUBSTRING(encode(gen_random_bytes(4), 'hex'), 1, 8)),
  product_id VARCHAR(50) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  current_stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 0,
  max_stock INTEGER NOT NULL DEFAULT 1000,
  reorder_point INTEGER NOT NULL DEFAULT 10,
  reserved_stock INTEGER NOT NULL DEFAULT 0,
  available_stock INTEGER GENERATED ALWAYS AS (current_stock - reserved_stock) STORED,
  last_restocked TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  location VARCHAR(50),
  status VARCHAR(20) DEFAULT 'optimal' CHECK (status IN ('optimal', 'low', 'critical', 'out-of-stock')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 재고 이력 테이블
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id SERIAL PRIMARY KEY,
  inventory_id VARCHAR(50) NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  product_id VARCHAR(50) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('purchase', 'sale', 'adjustment', 'return', 'damage', 'transfer')),
  quantity_change INTEGER NOT NULL,
  quantity_before INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,
  reason VARCHAR(255),
  reference_id VARCHAR(50), -- 주문번호, 입고번호 등
  user_id VARCHAR(50),
  notes TEXT,
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 재고 알림 설정 테이블
CREATE TABLE IF NOT EXISTS inventory_alerts (
  id SERIAL PRIMARY KEY,
  inventory_id VARCHAR(50) NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  alert_type VARCHAR(20) NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock', 'overstocked', 'reorder_needed')),
  threshold_value INTEGER,
  is_active BOOLEAN DEFAULT true,
  last_triggered TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. 재입고 요청 테이블
CREATE TABLE IF NOT EXISTS restock_requests (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'RST-' || UPPER(SUBSTRING(encode(gen_random_bytes(4), 'hex'), 1, 8)),
  inventory_id VARCHAR(50) NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  product_id VARCHAR(50) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  requested_quantity INTEGER NOT NULL,
  approved_quantity INTEGER,
  supplier VARCHAR(255),
  expected_date DATE,
  actual_date DATE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'ordered', 'received', 'cancelled')),
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  requested_by VARCHAR(50),
  approved_by VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);
CREATE INDEX IF NOT EXISTS idx_inventory_available_stock ON inventory(available_stock);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_inventory_id ON inventory_transactions(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_date ON inventory_transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_active ON inventory_alerts(is_active, alert_type);
CREATE INDEX IF NOT EXISTS idx_restock_requests_status ON restock_requests(status);
CREATE INDEX IF NOT EXISTS idx_restock_requests_priority ON restock_requests(priority, created_at DESC);

-- 재고 상태 자동 업데이트를 위한 함수
CREATE OR REPLACE FUNCTION update_inventory_status()
RETURNS TRIGGER AS $$
BEGIN
  -- 재고 상태 자동 계산
  IF NEW.current_stock <= 0 THEN
    NEW.status := 'out-of-stock';
  ELSIF NEW.current_stock <= NEW.reorder_point THEN
    NEW.status := 'critical';
  ELSIF NEW.current_stock <= NEW.min_stock THEN
    NEW.status := 'low';
  ELSE
    NEW.status := 'optimal';
  END IF;
  
  NEW.updated_at := CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER trigger_update_inventory_status
  BEFORE INSERT OR UPDATE ON inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_status();

-- 재고 변경 이력 자동 기록을 위한 함수
CREATE OR REPLACE FUNCTION log_inventory_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- INSERT의 경우 initial stock으로 기록
  IF TG_OP = 'INSERT' THEN
    INSERT INTO inventory_transactions (
      inventory_id, product_id, transaction_type, quantity_change,
      quantity_before, quantity_after, reason, user_id
    ) VALUES (
      NEW.id, NEW.product_id, 'adjustment', NEW.current_stock,
      0, NEW.current_stock, 'Initial stock setup', 'system'
    );
    RETURN NEW;
  END IF;
  
  -- UPDATE의 경우 재고 변경 기록
  IF TG_OP = 'UPDATE' AND OLD.current_stock != NEW.current_stock THEN
    INSERT INTO inventory_transactions (
      inventory_id, product_id, transaction_type, quantity_change,
      quantity_before, quantity_after, reason, user_id
    ) VALUES (
      NEW.id, NEW.product_id, 'adjustment', 
      NEW.current_stock - OLD.current_stock,
      OLD.current_stock, NEW.current_stock, 
      'Stock adjustment', COALESCE(current_user, 'system')
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 재고 변경 이력 트리거
CREATE TRIGGER trigger_log_inventory_transaction
  AFTER INSERT OR UPDATE ON inventory
  FOR EACH ROW
  EXECUTE FUNCTION log_inventory_transaction();