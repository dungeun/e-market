-- ============================================
-- 게시판 시스템 언어팩 데이터 (기존 language_packs 구조 사용)
-- Korean Enterprise Commerce Platform
-- ============================================

-- 게시판 관련 언어팩 삽입 (기존 language_packs 테이블 구조 사용)
INSERT INTO language_packs (language_code, namespace, key, value, description) VALUES

-- 게시판 공통 (한국어)
('ko', 'boards', 'title', '게시판', '게시판 제목'),
('ko', 'boards', 'list', '게시판 목록', '게시판 목록'),
('ko', 'boards', 'search', '검색', '검색'),
('ko', 'boards', 'write', '글쓰기', '글쓰기 버튼'),
('ko', 'boards', 'post', '게시글', '게시글'),
('ko', 'boards', 'comment', '댓글', '댓글'),
('ko', 'boards', 'author', '작성자', '작성자'),
('ko', 'boards', 'date', '작성일', '작성일'),
('ko', 'boards', 'views', '조회수', '조회수'),
('ko', 'boards', 'likes', '좋아요', '좋아요'),

-- 커뮤니티 게시판 (한국어)
('ko', 'boards', 'community.title', '커뮤니티', '커뮤니티 게시판'),
('ko', 'boards', 'community.description', '자유롭게 소통하고 정보를 공유하는 공간입니다.', '커뮤니티 설명'),
('ko', 'boards', 'community.write', '커뮤니티 글쓰기', '커뮤니티 글쓰기'),

-- FAQ 게시판 (한국어)
('ko', 'boards', 'faq.title', '자주 묻는 질문', 'FAQ 게시판'),
('ko', 'boards', 'faq.description', '자주 묻는 질문과 답변을 확인하실 수 있습니다.', 'FAQ 설명'),
('ko', 'boards', 'faq.question', '질문', '질문'),
('ko', 'boards', 'faq.answer', '답변', '답변'),

-- 1:1 문의 게시판 (한국어)
('ko', 'boards', 'inquiry.title', '1:1 문의', '1:1 문의 게시판'),
('ko', 'boards', 'inquiry.description', '개인적인 문의사항을 등록하고 답변을 받으실 수 있습니다.', '1:1 문의 설명'),
('ko', 'boards', 'inquiry.write', '문의하기', '문의하기'),
('ko', 'boards', 'inquiry.status', '처리상태', '처리상태'),
('ko', 'boards', 'inquiry.status.pending', '대기중', '대기중 상태'),
('ko', 'boards', 'inquiry.status.in_progress', '처리중', '처리중 상태'),
('ko', 'boards', 'inquiry.status.answered', '답변완료', '답변완료 상태'),
('ko', 'boards', 'inquiry.status.closed', '종료', '종료 상태'),

-- 게시글 작성/수정 (한국어)
('ko', 'boards', 'form.title', '제목', '제목'),
('ko', 'boards', 'form.content', '내용', '내용'),
('ko', 'boards', 'form.category', '카테고리', '카테고리'),
('ko', 'boards', 'form.tags', '태그', '태그'),

-- 버튼 (한국어)
('ko', 'boards', 'button.submit', '등록', '등록 버튼'),
('ko', 'boards', 'button.cancel', '취소', '취소 버튼'),
('ko', 'boards', 'button.edit', '수정', '수정 버튼'),
('ko', 'boards', 'button.delete', '삭제', '삭제 버튼'),
('ko', 'boards', 'button.like', '좋아요', '좋아요 버튼'),
('ko', 'boards', 'button.back_to_list', '목록으로', '목록으로 버튼'),

-- 메시지 (한국어)
('ko', 'boards', 'message.no_posts', '등록된 게시글이 없습니다.', '게시글 없음 메시지'),
('ko', 'boards', 'message.no_comments', '댓글이 없습니다.', '댓글 없음 메시지'),
('ko', 'boards', 'message.login_required', '로그인이 필요합니다.', '로그인 필요 메시지'),

-- 영어 번역
('en', 'boards', 'title', 'Board', 'Board title'),
('en', 'boards', 'list', 'Board List', 'Board list'),
('en', 'boards', 'search', 'Search', 'Search'),
('en', 'boards', 'write', 'Write', 'Write button'),
('en', 'boards', 'post', 'Post', 'Post'),
('en', 'boards', 'comment', 'Comment', 'Comment'),
('en', 'boards', 'author', 'Author', 'Author'),
('en', 'boards', 'date', 'Date', 'Date'),
('en', 'boards', 'views', 'Views', 'Views'),
('en', 'boards', 'likes', 'Likes', 'Likes'),

('en', 'boards', 'community.title', 'Community', 'Community board'),
('en', 'boards', 'community.description', 'A space to freely communicate and share information.', 'Community description'),
('en', 'boards', 'community.write', 'Write Post', 'Community write'),

('en', 'boards', 'faq.title', 'FAQ', 'FAQ board'),
('en', 'boards', 'faq.description', 'You can check frequently asked questions and answers.', 'FAQ description'),
('en', 'boards', 'faq.question', 'Question', 'Question'),
('en', 'boards', 'faq.answer', 'Answer', 'Answer'),

('en', 'boards', 'inquiry.title', '1:1 Inquiry', '1:1 inquiry board'),
('en', 'boards', 'inquiry.description', 'You can register personal inquiries and receive answers.', '1:1 inquiry description'),
('en', 'boards', 'inquiry.write', 'Submit Inquiry', 'Submit inquiry'),
('en', 'boards', 'inquiry.status', 'Status', 'Status'),
('en', 'boards', 'inquiry.status.pending', 'Pending', 'Pending status'),
('en', 'boards', 'inquiry.status.in_progress', 'In Progress', 'In progress status'),
('en', 'boards', 'inquiry.status.answered', 'Answered', 'Answered status'),
('en', 'boards', 'inquiry.status.closed', 'Closed', 'Closed status'),

('en', 'boards', 'form.title', 'Title', 'Title'),
('en', 'boards', 'form.content', 'Content', 'Content'),
('en', 'boards', 'form.category', 'Category', 'Category'),
('en', 'boards', 'form.tags', 'Tags', 'Tags'),

('en', 'boards', 'button.submit', 'Submit', 'Submit button'),
('en', 'boards', 'button.cancel', 'Cancel', 'Cancel button'),
('en', 'boards', 'button.edit', 'Edit', 'Edit button'),
('en', 'boards', 'button.delete', 'Delete', 'Delete button'),
('en', 'boards', 'button.like', 'Like', 'Like button'),
('en', 'boards', 'button.back_to_list', 'Back to List', 'Back to list button'),

('en', 'boards', 'message.no_posts', 'No posts found.', 'No posts message'),
('en', 'boards', 'message.no_comments', 'No comments yet.', 'No comments message'),
('en', 'boards', 'message.login_required', 'Login required.', 'Login required message')

ON CONFLICT (language_code, namespace, key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    updated_at = NOW();

COMMIT;