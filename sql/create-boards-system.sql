-- ============================================
-- 다국어 지원 게시판 시스템
-- Korean Enterprise Commerce Platform
-- ============================================

-- 게시판 타입 ENUM 추가
CREATE TYPE board_type AS ENUM ('COMMUNITY', 'FAQ', 'INQUIRY', 'NOTICE');
CREATE TYPE post_status AS ENUM ('DRAFT', 'PUBLISHED', 'HIDDEN', 'DELETED');
CREATE TYPE inquiry_status AS ENUM ('PENDING', 'IN_PROGRESS', 'ANSWERED', 'CLOSED');
CREATE TYPE post_visibility AS ENUM ('PUBLIC', 'PRIVATE', 'MEMBERS_ONLY');

-- ============================================
-- 게시판 테이블 (boards)
-- ============================================
CREATE TABLE boards (
    id VARCHAR(25) PRIMARY KEY DEFAULT 'board_' || encode(gen_random_bytes(8), 'hex'),
    code VARCHAR(50) UNIQUE NOT NULL, -- 'community', 'faq', 'inquiry' 등
    name VARCHAR(100) NOT NULL, -- 기본 이름 (한국어)
    description TEXT,
    type board_type NOT NULL,
    visibility post_visibility DEFAULT 'PUBLIC',
    allow_comments BOOLEAN DEFAULT TRUE,
    allow_attachments BOOLEAN DEFAULT TRUE,
    require_login BOOLEAN DEFAULT FALSE, -- 로그인 필수 여부
    allow_anonymous BOOLEAN DEFAULT FALSE, -- 익명 게시 허용 (1:1 문의용)
    max_attachment_size INTEGER DEFAULT 10485760, -- 10MB
    allowed_file_types TEXT[] DEFAULT ARRAY['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 게시글 테이블 (posts)
-- ============================================
CREATE TABLE posts (
    id VARCHAR(25) PRIMARY KEY DEFAULT 'post_' || encode(gen_random_bytes(8), 'hex'),
    board_id VARCHAR(25) NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    user_id VARCHAR(25) REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    summary TEXT, -- 요약 (목록용)
    status post_status DEFAULT 'PUBLISHED',
    visibility post_visibility DEFAULT 'PUBLIC',
    is_pinned BOOLEAN DEFAULT FALSE, -- 상단 고정
    is_featured BOOLEAN DEFAULT FALSE, -- 추천글
    is_anonymous BOOLEAN DEFAULT FALSE, -- 익명 게시글
    author_name VARCHAR(100), -- 익명일 경우 작성자명
    author_email VARCHAR(255), -- 익명일 경우 이메일
    author_phone VARCHAR(20), -- 1:1 문의용
    inquiry_status inquiry_status, -- 1:1 문의 전용
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    attachment_count INTEGER DEFAULT 0,
    tags TEXT[], -- 태그 배열
    metadata JSONB, -- 추가 메타데이터
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 댓글 테이블 (comments)
-- ============================================
CREATE TABLE comments (
    id VARCHAR(25) PRIMARY KEY DEFAULT 'comment_' || encode(gen_random_bytes(8), 'hex'),
    post_id VARCHAR(25) NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id VARCHAR(25) REFERENCES users(id) ON DELETE SET NULL,
    parent_id VARCHAR(25) REFERENCES comments(id) ON DELETE CASCADE, -- 대댓글용
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    author_name VARCHAR(100), -- 익명일 경우
    author_email VARCHAR(255), -- 익명일 경우
    is_admin_reply BOOLEAN DEFAULT FALSE, -- 관리자 답변
    is_deleted BOOLEAN DEFAULT FALSE,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 첨부파일 테이블 (post_attachments)
-- ============================================
CREATE TABLE post_attachments (
    id VARCHAR(25) PRIMARY KEY DEFAULT 'attach_' || encode(gen_random_bytes(8), 'hex'),
    post_id VARCHAR(25) NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    mime_type VARCHAR(100),
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 게시글 좋아요 테이블 (post_likes)
-- ============================================
CREATE TABLE post_likes (
    id VARCHAR(25) PRIMARY KEY DEFAULT 'like_' || encode(gen_random_bytes(8), 'hex'),
    post_id VARCHAR(25) NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id VARCHAR(25) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- ============================================
-- 댓글 좋아요 테이블 (comment_likes)
-- ============================================
CREATE TABLE comment_likes (
    id VARCHAR(25) PRIMARY KEY DEFAULT 'clike_' || encode(gen_random_bytes(8), 'hex'),
    comment_id VARCHAR(25) NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    user_id VARCHAR(25) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- ============================================
-- 인덱스 생성
-- ============================================

-- boards 테이블
CREATE INDEX idx_boards_type ON boards(type);
CREATE INDEX idx_boards_code ON boards(code);
CREATE INDEX idx_boards_active ON boards(is_active);

-- posts 테이블
CREATE INDEX idx_posts_board_id ON posts(board_id);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX idx_posts_is_pinned ON posts(is_pinned);
CREATE INDEX idx_posts_board_status ON posts(board_id, status);
CREATE INDEX idx_posts_inquiry_status ON posts(inquiry_status) WHERE inquiry_status IS NOT NULL;
CREATE INDEX idx_posts_search ON posts USING gin(to_tsvector('korean', title || ' ' || content));

-- comments 테이블
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- attachments 테이블
CREATE INDEX idx_attachments_post_id ON post_attachments(post_id);

-- likes 테이블
CREATE INDEX idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX idx_comment_likes_comment_id ON comment_likes(comment_id);

-- ============================================
-- 트리거 함수들
-- ============================================

-- updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 게시글 통계 업데이트
CREATE OR REPLACE FUNCTION update_post_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- 댓글 수 증가
        UPDATE posts SET 
            comment_count = comment_count + 1,
            updated_at = NOW()
        WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        -- 댓글 수 감소
        UPDATE posts SET 
            comment_count = GREATEST(0, comment_count - 1),
            updated_at = NOW()
        WHERE id = OLD.post_id;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ language 'plpgsql';

-- 좋아요 통계 업데이트
CREATE OR REPLACE FUNCTION update_like_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET 
            like_count = like_count + 1,
            updated_at = NOW()
        WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET 
            like_count = GREATEST(0, like_count - 1),
            updated_at = NOW()
        WHERE id = OLD.post_id;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ language 'plpgsql';

-- 댓글 좋아요 통계 업데이트
CREATE OR REPLACE FUNCTION update_comment_like_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE comments SET 
            like_count = like_count + 1,
            updated_at = NOW()
        WHERE id = NEW.comment_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE comments SET 
            like_count = GREATEST(0, like_count - 1),
            updated_at = NOW()
        WHERE id = OLD.comment_id;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ language 'plpgsql';

-- ============================================
-- 트리거 생성
-- ============================================

-- updated_at 트리거
CREATE TRIGGER update_boards_updated_at
    BEFORE UPDATE ON boards
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 통계 트리거
CREATE TRIGGER update_post_comment_stats
    AFTER INSERT OR DELETE ON comments
    FOR EACH ROW EXECUTE PROCEDURE update_post_stats();

CREATE TRIGGER update_post_like_stats
    AFTER INSERT OR DELETE ON post_likes
    FOR EACH ROW EXECUTE PROCEDURE update_like_stats();

CREATE TRIGGER update_comment_like_stats
    AFTER INSERT OR DELETE ON comment_likes
    FOR EACH ROW EXECUTE PROCEDURE update_comment_like_stats();

-- ============================================
-- 기본 게시판 데이터 삽입
-- ============================================

-- 커뮤니티 게시판
INSERT INTO boards (code, name, description, type, visibility, allow_comments, allow_attachments, require_login)
VALUES (
    'community',
    '커뮤니티',
    '자유롭게 소통하고 정보를 공유하는 공간입니다.',
    'COMMUNITY',
    'PUBLIC',
    true,
    true,
    false
);

-- FAQ 게시판
INSERT INTO boards (code, name, description, type, visibility, allow_comments, allow_attachments, require_login)
VALUES (
    'faq',
    '자주 묻는 질문',
    '자주 묻는 질문과 답변을 확인하실 수 있습니다.',
    'FAQ',
    'PUBLIC',
    false,
    false,
    false
);

-- 1:1 문의 게시판
INSERT INTO boards (code, name, description, type, visibility, allow_comments, allow_attachments, require_login, allow_anonymous)
VALUES (
    'inquiry',
    '1:1 문의',
    '개인적인 문의사항을 등록하고 답변을 받으실 수 있습니다.',
    'INQUIRY',
    'PRIVATE',
    true,
    true,
    false,
    true
);

-- 공지사항 게시판
INSERT INTO boards (code, name, description, type, visibility, allow_comments, allow_attachments, require_login)
VALUES (
    'notice',
    '공지사항',
    '중요한 공지사항을 확인하실 수 있습니다.',
    'NOTICE',
    'PUBLIC',
    false,
    false,
    false
);

COMMIT;