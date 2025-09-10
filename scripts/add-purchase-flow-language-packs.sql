-- Purchase Flow Language Pack Keys Migration
-- Date: 2025-09-08
-- Purpose: Add language pack keys for purchase flow (products, cart, checkout)
-- Languages: ko, en, fr (based on DEFAULT_LANGUAGES setting)

-- Insert purchase flow language pack keys
INSERT INTO language_pack_keys (key_name, component_type, component_id, description) VALUES
-- Products Page Keys
('products.title', 'page', 'products', 'Products page main title'),
('products.subtitle', 'page', 'products', 'Products page subtitle'),
('products.search', 'page', 'products', 'Search section title'),
('products.search_placeholder', 'page', 'products', 'Search input placeholder'),
('products.category', 'page', 'products', 'Category filter title'),
('products.all_categories', 'page', 'products', 'All categories option'),
('products.price_filter', 'page', 'products', 'Price filter title'),
('products.sort', 'page', 'products', 'Sort section title'),
('products.sort_newest', 'page', 'products', 'Sort by newest option'),
('products.sort_price_low', 'page', 'products', 'Sort by price low to high'),
('products.sort_price_high', 'page', 'products', 'Sort by price high to low'),
('products.sort_name', 'page', 'products', 'Sort by name option'),
('products.no_results', 'page', 'products', 'No search results message'),
('products.prev', 'page', 'products', 'Previous page button'),
('products.next', 'page', 'products', 'Next page button'),

-- Cart Page Keys
('cart.title', 'page', 'cart', 'Shopping cart page title'),
('cart.empty_message', 'page', 'cart', 'Empty cart message'),
('cart.continue_shopping', 'page', 'cart', 'Continue shopping button'),
('cart.order_summary', 'page', 'cart', 'Order summary section title'),
('cart.item_count', 'page', 'cart', 'Item count label'),
('cart.subtotal', 'page', 'cart', 'Subtotal label'),
('cart.shipping', 'page', 'cart', 'Shipping fee label'),
('cart.free_shipping', 'page', 'cart', 'Free shipping text'),
('cart.total', 'page', 'cart', 'Total amount label'),
('cart.checkout', 'page', 'cart', 'Checkout button'),

-- Checkout Page Keys
('checkout.title', 'page', 'checkout', 'Checkout page title'),
('checkout.shipping_info', 'page', 'checkout', 'Shipping information section'),
('checkout.recipient', 'page', 'checkout', 'Recipient name field label'),
('checkout.phone', 'page', 'checkout', 'Phone number field label'),
('checkout.email', 'page', 'checkout', 'Email field label'),
('checkout.address', 'page', 'checkout', 'Address field label'),
('checkout.phone_placeholder', 'page', 'checkout', 'Phone input placeholder'),
('checkout.postcode', 'page', 'checkout', 'Postcode field placeholder'),
('checkout.address_basic', 'page', 'checkout', 'Basic address field placeholder'),
('checkout.address_detail', 'page', 'checkout', 'Detailed address field placeholder'),
('checkout.address_search', 'page', 'checkout', 'Address search button'),
('checkout.delivery_message', 'page', 'checkout', 'Delivery message field label'),
('checkout.delivery_request', 'page', 'checkout', 'Delivery request placeholder'),
('checkout.payment_method', 'page', 'checkout', 'Payment method section'),
('checkout.cash_payment', 'page', 'checkout', 'Cash payment option'),
('checkout.cash_description', 'page', 'checkout', 'Cash payment description'),
('checkout.cash_only', 'page', 'checkout', 'Cash only notice'),
('checkout.order_summary', 'page', 'checkout', 'Order summary section'),
('checkout.quantity', 'page', 'checkout', 'Quantity label'),
('checkout.processing', 'page', 'checkout', 'Processing button text'),
('checkout.pay_button', 'page', 'checkout', 'Pay button text'),
('checkout.cash_notice', 'page', 'checkout', 'Cash payment instruction'),
('checkout.validation_required', 'page', 'checkout', 'Validation error message'),
('checkout.payment_error', 'page', 'checkout', 'Payment error message'),
('checkout.free_shipping_notice', 'page', 'checkout', 'Free shipping notice'),

-- Common Loading and No Image
('common.loading_text', 'common', null, 'Loading text'),
('common.no_image', 'common', null, 'No image placeholder')

ON CONFLICT DO NOTHING;

-- Insert Korean (ko) translations
INSERT INTO language_pack_translations (key_id, language_code, translation, is_auto_translated)
SELECT 
    lpk.id,
    'ko',
    CASE lpk.key_name
        -- Products Page
        WHEN 'products.title' THEN '전체 상품'
        WHEN 'products.subtitle' THEN '원하시는 상품을 찾아보세요'
        WHEN 'products.search' THEN '검색'
        WHEN 'products.search_placeholder' THEN '상품명 검색...'
        WHEN 'products.category' THEN '카테고리'
        WHEN 'products.all_categories' THEN '전체'
        WHEN 'products.price_filter' THEN '가격'
        WHEN 'products.sort' THEN '정렬'
        WHEN 'products.sort_newest' THEN '최신순'
        WHEN 'products.sort_price_low' THEN '가격 낮은순'
        WHEN 'products.sort_price_high' THEN '가격 높은순'
        WHEN 'products.sort_name' THEN '이름순'
        WHEN 'products.no_results' THEN '검색 결과가 없습니다.'
        WHEN 'products.prev' THEN '이전'
        WHEN 'products.next' THEN '다음'
        -- Cart Page
        WHEN 'cart.title' THEN '장바구니'
        WHEN 'cart.empty_message' THEN '장바구니가 비어있습니다.'
        WHEN 'cart.continue_shopping' THEN '쇼핑 계속하기'
        WHEN 'cart.order_summary' THEN '주문 요약'
        WHEN 'cart.item_count' THEN '상품 수'
        WHEN 'cart.subtotal' THEN '상품 금액'
        WHEN 'cart.shipping' THEN '배송비'
        WHEN 'cart.free_shipping' THEN '무료'
        WHEN 'cart.total' THEN '총 결제금액'
        WHEN 'cart.checkout' THEN '주문하기'
        -- Checkout Page
        WHEN 'checkout.title' THEN '주문/결제'
        WHEN 'checkout.shipping_info' THEN '배송 정보'
        WHEN 'checkout.recipient' THEN '받는 분 *'
        WHEN 'checkout.phone' THEN '연락처 *'
        WHEN 'checkout.email' THEN '이메일'
        WHEN 'checkout.address' THEN '주소 *'
        WHEN 'checkout.phone_placeholder' THEN '010-0000-0000'
        WHEN 'checkout.postcode' THEN '우편번호'
        WHEN 'checkout.address_basic' THEN '기본 주소'
        WHEN 'checkout.address_detail' THEN '상세 주소'
        WHEN 'checkout.address_search' THEN '주소 검색'
        WHEN 'checkout.delivery_message' THEN '배송 메시지'
        WHEN 'checkout.delivery_request' THEN '배송 시 요청사항을 입력해주세요'
        WHEN 'checkout.payment_method' THEN '결제 방법'
        WHEN 'checkout.cash_payment' THEN '현금결제'
        WHEN 'checkout.cash_description' THEN '현장에서 현금으로 결제'
        WHEN 'checkout.cash_only' THEN '현재 현금결제만 지원됩니다'
        WHEN 'checkout.order_summary' THEN '주문 요약'
        WHEN 'checkout.quantity' THEN '수량:'
        WHEN 'checkout.processing' THEN '처리 중...'
        WHEN 'checkout.pay_button' THEN '결제하기'
        WHEN 'checkout.cash_notice' THEN '주문 확인 후 현장에서 현금으로 결제해주세요'
        WHEN 'checkout.validation_required' THEN '배송 정보를 모두 입력해주세요.'
        WHEN 'checkout.payment_error' THEN '결제 처리 중 오류가 발생했습니다.'
        WHEN 'checkout.free_shipping_notice' THEN '추가 주문 시 무료배송'
        -- Common
        WHEN 'common.loading_text' THEN '로딩 중...'
        WHEN 'common.no_image' THEN 'No Image'
        ELSE lpk.key_name
    END,
    false
FROM language_pack_keys lpk
WHERE lpk.key_name LIKE 'products.%' OR lpk.key_name LIKE 'cart.%' OR lpk.key_name LIKE 'checkout.%' 
   OR lpk.key_name IN ('common.loading_text', 'common.no_image')
ON CONFLICT DO NOTHING;

-- Insert English (en) translations
INSERT INTO language_pack_translations (key_id, language_code, translation, is_auto_translated)
SELECT 
    lpk.id,
    'en',
    CASE lpk.key_name
        -- Products Page
        WHEN 'products.title' THEN 'All Products'
        WHEN 'products.subtitle' THEN 'Find the products you want'
        WHEN 'products.search' THEN 'Search'
        WHEN 'products.search_placeholder' THEN 'Search products...'
        WHEN 'products.category' THEN 'Category'
        WHEN 'products.all_categories' THEN 'All'
        WHEN 'products.price_filter' THEN 'Price'
        WHEN 'products.sort' THEN 'Sort'
        WHEN 'products.sort_newest' THEN 'Newest'
        WHEN 'products.sort_price_low' THEN 'Price: Low to High'
        WHEN 'products.sort_price_high' THEN 'Price: High to Low'
        WHEN 'products.sort_name' THEN 'Name'
        WHEN 'products.no_results' THEN 'No search results found.'
        WHEN 'products.prev' THEN 'Previous'
        WHEN 'products.next' THEN 'Next'
        -- Cart Page
        WHEN 'cart.title' THEN 'Shopping Cart'
        WHEN 'cart.empty_message' THEN 'Your cart is empty.'
        WHEN 'cart.continue_shopping' THEN 'Continue Shopping'
        WHEN 'cart.order_summary' THEN 'Order Summary'
        WHEN 'cart.item_count' THEN 'Items'
        WHEN 'cart.subtotal' THEN 'Subtotal'
        WHEN 'cart.shipping' THEN 'Shipping'
        WHEN 'cart.free_shipping' THEN 'Free'
        WHEN 'cart.total' THEN 'Total'
        WHEN 'cart.checkout' THEN 'Checkout'
        -- Checkout Page
        WHEN 'checkout.title' THEN 'Order & Payment'
        WHEN 'checkout.shipping_info' THEN 'Shipping Information'
        WHEN 'checkout.recipient' THEN 'Recipient *'
        WHEN 'checkout.phone' THEN 'Phone *'
        WHEN 'checkout.email' THEN 'Email'
        WHEN 'checkout.address' THEN 'Address *'
        WHEN 'checkout.phone_placeholder' THEN '010-0000-0000'
        WHEN 'checkout.postcode' THEN 'Postcode'
        WHEN 'checkout.address_basic' THEN 'Basic Address'
        WHEN 'checkout.address_detail' THEN 'Detailed Address'
        WHEN 'checkout.address_search' THEN 'Search Address'
        WHEN 'checkout.delivery_message' THEN 'Delivery Message'
        WHEN 'checkout.delivery_request' THEN 'Enter your delivery instructions'
        WHEN 'checkout.payment_method' THEN 'Payment Method'
        WHEN 'checkout.cash_payment' THEN 'Cash Payment'
        WHEN 'checkout.cash_description' THEN 'Pay with cash on delivery'
        WHEN 'checkout.cash_only' THEN 'Currently only cash payment is supported'
        WHEN 'checkout.order_summary' THEN 'Order Summary'
        WHEN 'checkout.quantity' THEN 'Qty:'
        WHEN 'checkout.processing' THEN 'Processing...'
        WHEN 'checkout.pay_button' THEN 'Pay'
        WHEN 'checkout.cash_notice' THEN 'Please pay with cash upon delivery confirmation'
        WHEN 'checkout.validation_required' THEN 'Please fill in all shipping information.'
        WHEN 'checkout.payment_error' THEN 'An error occurred during payment processing.'
        WHEN 'checkout.free_shipping_notice' THEN 'Free shipping on additional orders'
        -- Common
        WHEN 'common.loading_text' THEN 'Loading...'
        WHEN 'common.no_image' THEN 'No Image'
        ELSE lpk.key_name
    END,
    false
FROM language_pack_keys lpk
WHERE lpk.key_name LIKE 'products.%' OR lpk.key_name LIKE 'cart.%' OR lpk.key_name LIKE 'checkout.%' 
   OR lpk.key_name IN ('common.loading_text', 'common.no_image')
ON CONFLICT DO NOTHING;

-- Insert French (fr) translations
INSERT INTO language_pack_translations (key_id, language_code, translation, is_auto_translated)
SELECT 
    lpk.id,
    'fr',
    CASE lpk.key_name
        -- Products Page
        WHEN 'products.title' THEN 'Tous les Produits'
        WHEN 'products.subtitle' THEN 'Trouvez les produits que vous voulez'
        WHEN 'products.search' THEN 'Recherche'
        WHEN 'products.search_placeholder' THEN 'Rechercher des produits...'
        WHEN 'products.category' THEN 'Catégorie'
        WHEN 'products.all_categories' THEN 'Tout'
        WHEN 'products.price_filter' THEN 'Prix'
        WHEN 'products.sort' THEN 'Trier'
        WHEN 'products.sort_newest' THEN 'Plus récent'
        WHEN 'products.sort_price_low' THEN 'Prix: Croissant'
        WHEN 'products.sort_price_high' THEN 'Prix: Décroissant'
        WHEN 'products.sort_name' THEN 'Nom'
        WHEN 'products.no_results' THEN 'Aucun résultat trouvé.'
        WHEN 'products.prev' THEN 'Précédent'
        WHEN 'products.next' THEN 'Suivant'
        -- Cart Page
        WHEN 'cart.title' THEN 'Panier'
        WHEN 'cart.empty_message' THEN 'Votre panier est vide.'
        WHEN 'cart.continue_shopping' THEN 'Continuer les Achats'
        WHEN 'cart.order_summary' THEN 'Résumé de Commande'
        WHEN 'cart.item_count' THEN 'Articles'
        WHEN 'cart.subtotal' THEN 'Sous-total'
        WHEN 'cart.shipping' THEN 'Livraison'
        WHEN 'cart.free_shipping' THEN 'Gratuit'
        WHEN 'cart.total' THEN 'Total'
        WHEN 'cart.checkout' THEN 'Commander'
        -- Checkout Page
        WHEN 'checkout.title' THEN 'Commande & Paiement'
        WHEN 'checkout.shipping_info' THEN 'Informations de Livraison'
        WHEN 'checkout.recipient' THEN 'Destinataire *'
        WHEN 'checkout.phone' THEN 'Téléphone *'
        WHEN 'checkout.email' THEN 'Email'
        WHEN 'checkout.address' THEN 'Adresse *'
        WHEN 'checkout.phone_placeholder' THEN '01-23-45-67-89'
        WHEN 'checkout.postcode' THEN 'Code Postal'
        WHEN 'checkout.address_basic' THEN 'Adresse de Base'
        WHEN 'checkout.address_detail' THEN 'Adresse Détaillée'
        WHEN 'checkout.address_search' THEN 'Rechercher Adresse'
        WHEN 'checkout.delivery_message' THEN 'Message de Livraison'
        WHEN 'checkout.delivery_request' THEN 'Entrez vos instructions de livraison'
        WHEN 'checkout.payment_method' THEN 'Méthode de Paiement'
        WHEN 'checkout.cash_payment' THEN 'Paiement en Espèces'
        WHEN 'checkout.cash_description' THEN 'Payer en espèces à la livraison'
        WHEN 'checkout.cash_only' THEN 'Actuellement, seul le paiement en espèces est supporté'
        WHEN 'checkout.order_summary' THEN 'Résumé de Commande'
        WHEN 'checkout.quantity' THEN 'Qté:'
        WHEN 'checkout.processing' THEN 'Traitement...'
        WHEN 'checkout.pay_button' THEN 'Payer'
        WHEN 'checkout.cash_notice' THEN 'Veuillez payer en espèces lors de la confirmation de livraison'
        WHEN 'checkout.validation_required' THEN 'Veuillez remplir toutes les informations de livraison.'
        WHEN 'checkout.payment_error' THEN 'Une erreur s''est produite lors du traitement du paiement.'
        WHEN 'checkout.free_shipping_notice' THEN 'Livraison gratuite sur commandes supplémentaires'
        -- Common
        WHEN 'common.loading_text' THEN 'Chargement...'
        WHEN 'common.no_image' THEN 'Pas d''Image'
        ELSE lpk.key_name
    END,
    false
FROM language_pack_keys lpk
WHERE lpk.key_name LIKE 'products.%' OR lpk.key_name LIKE 'cart.%' OR lpk.key_name LIKE 'checkout.%' 
   OR lpk.key_name IN ('common.loading_text', 'common.no_image')
ON CONFLICT DO NOTHING;