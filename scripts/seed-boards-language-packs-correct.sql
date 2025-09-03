-- ============================================
-- 게시판 시스템 언어팩 데이터 (정확한 구조 사용)
-- Korean Enterprise Commerce Platform
-- ============================================

-- 게시판 관련 언어팩 키 생성 및 번역 삽입
BEGIN;

-- 1. 언어팩 키 생성
INSERT INTO language_pack_keys (key_name, component_type, description, is_active) VALUES
('boards.title', 'boards', '게시판 제목', true),
('boards.list', 'boards', '게시판 목록', true),
('boards.search', 'boards', '검색', true),
('boards.write', 'boards', '글쓰기 버튼', true),
('boards.post', 'boards', '게시글', true),
('boards.comment', 'boards', '댓글', true),
('boards.author', 'boards', '작성자', true),
('boards.date', 'boards', '작성일', true),
('boards.views', 'boards', '조회수', true),
('boards.likes', 'boards', '좋아요', true),

-- 커뮤니티
('boards.community.title', 'boards', '커뮤니티 게시판', true),
('boards.community.description', 'boards', '커뮤니티 설명', true),
('boards.community.write', 'boards', '커뮤니티 글쓰기', true),

-- FAQ
('boards.faq.title', 'boards', 'FAQ 게시판', true),
('boards.faq.description', 'boards', 'FAQ 설명', true),
('boards.faq.question', 'boards', '질문', true),
('boards.faq.answer', 'boards', '답변', true),

-- 1:1 문의
('boards.inquiry.title', 'boards', '1:1 문의 게시판', true),
('boards.inquiry.description', 'boards', '1:1 문의 설명', true),
('boards.inquiry.write', 'boards', '문의하기', true),
('boards.inquiry.status', 'boards', '처리상태', true),
('boards.inquiry.status.pending', 'boards', '대기중 상태', true),
('boards.inquiry.status.in_progress', 'boards', '처리중 상태', true),
('boards.inquiry.status.answered', 'boards', '답변완료 상태', true),
('boards.inquiry.status.closed', 'boards', '종료 상태', true),

-- 폼
('boards.form.title', 'boards', '제목', true),
('boards.form.content', 'boards', '내용', true),
('boards.form.category', 'boards', '카테고리', true),
('boards.form.tags', 'boards', '태그', true),

-- 버튼
('boards.button.submit', 'boards', '등록 버튼', true),
('boards.button.cancel', 'boards', '취소 버튼', true),
('boards.button.edit', 'boards', '수정 버튼', true),
('boards.button.delete', 'boards', '삭제 버튼', true),
('boards.button.like', 'boards', '좋아요 버튼', true),
('boards.button.back_to_list', 'boards', '목록으로 버튼', true),

-- 메시지
('boards.message.no_posts', 'boards', '게시글 없음 메시지', true),
('boards.message.no_comments', 'boards', '댓글 없음 메시지', true),
('boards.message.login_required', 'boards', '로그인 필요 메시지', true)
ON CONFLICT (key_name) DO NOTHING;

-- 2. 한국어 번역 삽입
INSERT INTO language_pack_translations (key_id, language_code, translation) 
SELECT k.id, 'ko', v.translation
FROM language_pack_keys k
CROSS JOIN (VALUES 
    ('boards.title', '게시판'),
    ('boards.list', '게시판 목록'),
    ('boards.search', '검색'),
    ('boards.write', '글쓰기'),
    ('boards.post', '게시글'),
    ('boards.comment', '댓글'),
    ('boards.author', '작성자'),
    ('boards.date', '작성일'),
    ('boards.views', '조회수'),
    ('boards.likes', '좋아요'),
    ('boards.community.title', '커뮤니티'),
    ('boards.community.description', '자유롭게 소통하고 정보를 공유하는 공간입니다.'),
    ('boards.community.write', '커뮤니티 글쓰기'),
    ('boards.faq.title', '자주 묻는 질문'),
    ('boards.faq.description', '자주 묻는 질문과 답변을 확인하실 수 있습니다.'),
    ('boards.faq.question', '질문'),
    ('boards.faq.answer', '답변'),
    ('boards.inquiry.title', '1:1 문의'),
    ('boards.inquiry.description', '개인적인 문의사항을 등록하고 답변을 받으실 수 있습니다.'),
    ('boards.inquiry.write', '문의하기'),
    ('boards.inquiry.status', '처리상태'),
    ('boards.inquiry.status.pending', '대기중'),
    ('boards.inquiry.status.in_progress', '처리중'),
    ('boards.inquiry.status.answered', '답변완료'),
    ('boards.inquiry.status.closed', '종료'),
    ('boards.form.title', '제목'),
    ('boards.form.content', '내용'),
    ('boards.form.category', '카테고리'),
    ('boards.form.tags', '태그'),
    ('boards.button.submit', '등록'),
    ('boards.button.cancel', '취소'),
    ('boards.button.edit', '수정'),
    ('boards.button.delete', '삭제'),
    ('boards.button.like', '좋아요'),
    ('boards.button.back_to_list', '목록으로'),
    ('boards.message.no_posts', '등록된 게시글이 없습니다.'),
    ('boards.message.no_comments', '댓글이 없습니다.'),
    ('boards.message.login_required', '로그인이 필요합니다.')
) v(key_name, translation)
WHERE k.key_name = v.key_name
ON CONFLICT (key_id, language_code) DO UPDATE SET
    translation = EXCLUDED.translation,
    updated_at = CURRENT_TIMESTAMP;

-- 3. 영어 번역 삽입
INSERT INTO language_pack_translations (key_id, language_code, translation) 
SELECT k.id, 'en', v.translation
FROM language_pack_keys k
CROSS JOIN (VALUES 
    ('boards.title', 'Board'),
    ('boards.list', 'Board List'),
    ('boards.search', 'Search'),
    ('boards.write', 'Write'),
    ('boards.post', 'Post'),
    ('boards.comment', 'Comment'),
    ('boards.author', 'Author'),
    ('boards.date', 'Date'),
    ('boards.views', 'Views'),
    ('boards.likes', 'Likes'),
    ('boards.community.title', 'Community'),
    ('boards.community.description', 'A space to freely communicate and share information.'),
    ('boards.community.write', 'Write Post'),
    ('boards.faq.title', 'FAQ'),
    ('boards.faq.description', 'You can check frequently asked questions and answers.'),
    ('boards.faq.question', 'Question'),
    ('boards.faq.answer', 'Answer'),
    ('boards.inquiry.title', '1:1 Inquiry'),
    ('boards.inquiry.description', 'You can register personal inquiries and receive answers.'),
    ('boards.inquiry.write', 'Submit Inquiry'),
    ('boards.inquiry.status', 'Status'),
    ('boards.inquiry.status.pending', 'Pending'),
    ('boards.inquiry.status.in_progress', 'In Progress'),
    ('boards.inquiry.status.answered', 'Answered'),
    ('boards.inquiry.status.closed', 'Closed'),
    ('boards.form.title', 'Title'),
    ('boards.form.content', 'Content'),
    ('boards.form.category', 'Category'),
    ('boards.form.tags', 'Tags'),
    ('boards.button.submit', 'Submit'),
    ('boards.button.cancel', 'Cancel'),
    ('boards.button.edit', 'Edit'),
    ('boards.button.delete', 'Delete'),
    ('boards.button.like', 'Like'),
    ('boards.button.back_to_list', 'Back to List'),
    ('boards.message.no_posts', 'No posts found.'),
    ('boards.message.no_comments', 'No comments yet.'),
    ('boards.message.login_required', 'Login required.')
) v(key_name, translation)
WHERE k.key_name = v.key_name
ON CONFLICT (key_id, language_code) DO UPDATE SET
    translation = EXCLUDED.translation,
    updated_at = CURRENT_TIMESTAMP;

COMMIT;