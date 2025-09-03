-- ============================================
-- 게시판 시스템 언어팩 데이터
-- Korean Enterprise Commerce Platform
-- ============================================

-- 게시판 관련 언어팩 삽입
INSERT INTO language_packs (key, ko, en, ja, zh, category, description) VALUES

-- 게시판 공통
('boards.title', '게시판', 'Board', '掲示板', '公告板', 'boards', '게시판 제목'),
('boards.list', '게시판 목록', 'Board List', '掲示板一覧', '公告板列表', 'boards', '게시판 목록'),
('boards.search', '검색', 'Search', '検索', '搜索', 'boards', '검색'),
('boards.write', '글쓰기', 'Write', '投稿', '写文章', 'boards', '글쓰기 버튼'),
('boards.post', '게시글', 'Post', '投稿', '帖子', 'boards', '게시글'),
('boards.comment', '댓글', 'Comment', 'コメント', '评论', 'boards', '댓글'),
('boards.reply', '답글', 'Reply', '返信', '回复', 'boards', '답글'),
('boards.author', '작성자', 'Author', '投稿者', '作者', 'boards', '작성자'),
('boards.date', '작성일', 'Date', '投稿日', '发布日期', 'boards', '작성일'),
('boards.views', '조회수', 'Views', '閲覧数', '查看次数', 'boards', '조회수'),
('boards.likes', '좋아요', 'Likes', 'いいね', '点赞', 'boards', '좋아요'),
('boards.attachments', '첨부파일', 'Attachments', '添付ファイル', '附件', 'boards', '첨부파일'),

-- 커뮤니티 게시판
('boards.community.title', '커뮤니티', 'Community', 'コミュニティ', '社区', 'boards', '커뮤니티 게시판'),
('boards.community.description', '자유롭게 소통하고 정보를 공유하는 공간입니다.', 'A space to freely communicate and share information.', '自由にコミュニケーションを取り、情報を共有する空間です。', '自由交流和信息分享的空间。', 'boards', '커뮤니티 설명'),
('boards.community.write', '커뮤니티 글쓰기', 'Write Post', '投稿作成', '写社区帖子', 'boards', '커뮤니티 글쓰기'),

-- FAQ 게시판
('boards.faq.title', '자주 묻는 질문', 'FAQ', 'よくある質問', '常见问题', 'boards', 'FAQ 게시판'),
('boards.faq.description', '자주 묻는 질문과 답변을 확인하실 수 있습니다.', 'You can check frequently asked questions and answers.', 'よくある質問と回答をご確認いただけます。', '您可以查看常见问题和答案。', 'boards', 'FAQ 설명'),
('boards.faq.question', '질문', 'Question', '質問', '问题', 'boards', '질문'),
('boards.faq.answer', '답변', 'Answer', '回答', '答案', 'boards', '답변'),
('boards.faq.category', '카테고리', 'Category', 'カテゴリ', '分类', 'boards', '카테고리'),

-- 1:1 문의 게시판
('boards.inquiry.title', '1:1 문의', '1:1 Inquiry', '1対1お問い合わせ', '1对1咨询', 'boards', '1:1 문의 게시판'),
('boards.inquiry.description', '개인적인 문의사항을 등록하고 답변을 받으실 수 있습니다.', 'You can register personal inquiries and receive answers.', '個人的なお問い合わせを登録し、回答を受け取ることができます。', '您可以提交个人咨询并获得答复。', 'boards', '1:1 문의 설명'),
('boards.inquiry.write', '문의하기', 'Submit Inquiry', 'お問い合わせ', '提交咨询', 'boards', '문의하기'),
('boards.inquiry.status', '처리상태', 'Status', '処理状況', '处理状态', 'boards', '처리상태'),
('boards.inquiry.status.pending', '대기중', 'Pending', '待機中', '等待中', 'boards', '대기중 상태'),
('boards.inquiry.status.in_progress', '처리중', 'In Progress', '処理中', '处理中', 'boards', '처리중 상태'),
('boards.inquiry.status.answered', '답변완료', 'Answered', '回答完了', '已回答', 'boards', '답변완료 상태'),
('boards.inquiry.status.closed', '종료', 'Closed', '終了', '已关闭', 'boards', '종료 상태'),
('boards.inquiry.private', '비공개', 'Private', '非公開', '私有', 'boards', '비공개'),
('boards.inquiry.name', '이름', 'Name', 'お名前', '姓名', 'boards', '이름'),
('boards.inquiry.email', '이메일', 'Email', 'メール', '邮箱', 'boards', '이메일'),
('boards.inquiry.phone', '연락처', 'Phone', '電話番号', '联系电话', 'boards', '연락처'),

-- 공지사항
('boards.notice.title', '공지사항', 'Notice', 'お知らせ', '公告', 'boards', '공지사항'),
('boards.notice.description', '중요한 공지사항을 확인하실 수 있습니다.', 'You can check important notices.', '重要なお知らせをご確認いただけます。', '您可以查看重要公告。', 'boards', '공지사항 설명'),
('boards.notice.important', '중요', 'Important', '重要', '重要', 'boards', '중요 공지'),
('boards.notice.pinned', '고정', 'Pinned', '固定', '置顶', 'boards', '고정 글'),

-- 게시글 작성/수정
('boards.form.title', '제목', 'Title', 'タイトル', '标题', 'boards', '제목'),
('boards.form.content', '내용', 'Content', '内容', '内容', 'boards', '내용'),
('boards.form.category', '카테고리', 'Category', 'カテゴリ', '分类', 'boards', '카테고리'),
('boards.form.tags', '태그', 'Tags', 'タグ', '标签', 'boards', '태그'),
('boards.form.anonymous', '익명', 'Anonymous', '匿名', '匿名', 'boards', '익명'),
('boards.form.private', '비공개', 'Private', '非公開', '私有', 'boards', '비공개'),
('boards.form.attach_files', '파일 첨부', 'Attach Files', 'ファイル添付', '附加文件', 'boards', '파일 첨부'),
('boards.form.file_limit', '파일 크기는 10MB 이하만 가능합니다.', 'File size must be 10MB or less.', 'ファイルサイズは10MB以下でなければなりません。', '文件大小必须在10MB以内。', 'boards', '파일 크기 제한'),
('boards.form.allowed_types', '허용 파일 형식: jpg, png, gif, pdf, doc, docx', 'Allowed file types: jpg, png, gif, pdf, doc, docx', '許可されたファイル形式：jpg、png、gif、pdf、doc、docx', '允许的文件格式：jpg、png、gif、pdf、doc、docx', 'boards', '허용 파일 형식'),

-- 버튼
('boards.button.submit', '등록', 'Submit', '登録', '提交', 'boards', '등록 버튼'),
('boards.button.cancel', '취소', 'Cancel', 'キャンセル', '取消', 'boards', '취소 버튼'),
('boards.button.edit', '수정', 'Edit', '編集', '编辑', 'boards', '수정 버튼'),
('boards.button.delete', '삭제', 'Delete', '削除', '删除', 'boards', '삭제 버튼'),
('boards.button.like', '좋아요', 'Like', 'いいね', '点赞', 'boards', '좋아요 버튼'),
('boards.button.share', '공유', 'Share', '共有', '分享', 'boards', '공유 버튼'),
('boards.button.report', '신고', 'Report', '報告', '举报', 'boards', '신고 버튼'),
('boards.button.back_to_list', '목록으로', 'Back to List', '一覧に戻る', '返回列表', 'boards', '목록으로 버튼'),

-- 메시지
('boards.message.no_posts', '등록된 게시글이 없습니다.', 'No posts found.', '登録された投稿がありません。', '没有找到帖子。', 'boards', '게시글 없음 메시지'),
('boards.message.no_comments', '댓글이 없습니다.', 'No comments yet.', 'コメントはありません。', '还没有评论。', 'boards', '댓글 없음 메시지'),
('boards.message.login_required', '로그인이 필요합니다.', 'Login required.', 'ログインが必要です。', '需要登录。', 'boards', '로그인 필요 메시지'),
('boards.message.post_saved', '게시글이 저장되었습니다.', 'Post has been saved.', '投稿が保存されました。', '帖子已保存。', 'boards', '게시글 저장 메시지'),
('boards.message.post_deleted', '게시글이 삭제되었습니다.', 'Post has been deleted.', '投稿が削除されました。', '帖子已删除。', 'boards', '게시글 삭제 메시지'),
('boards.message.comment_saved', '댓글이 등록되었습니다.', 'Comment has been posted.', 'コメントが登録されました。', '评论已发布。', 'boards', '댓글 등록 메시지'),
('boards.message.like_added', '좋아요를 눌렀습니다.', 'Liked.', 'いいねを押しました。', '已点赞。', 'boards', '좋아요 추가 메시지'),
('boards.message.like_removed', '좋아요를 취소했습니다.', 'Like removed.', 'いいねを取り消しました。', '取消点赞。', 'boards', '좋아요 취소 메시지'),

-- 검색 및 필터
('boards.search.placeholder', '제목, 내용, 작성자로 검색', 'Search by title, content, author', 'タイトル、内容、投稿者で検索', '按标题、内容、作者搜索', 'boards', '검색 placeholder'),
('boards.filter.all', '전체', 'All', '全て', '全部', 'boards', '전체 필터'),
('boards.filter.recent', '최신순', 'Recent', '最新順', '最新', 'boards', '최신순 필터'),
('boards.filter.popular', '인기순', 'Popular', '人気順', '热门', 'boards', '인기순 필터'),
('boards.filter.most_viewed', '조회순', 'Most Viewed', '閲覧順', '浏览量', 'boards', '조회순 필터'),
('boards.filter.most_liked', '좋아요순', 'Most Liked', 'いいね順', '点赞数', 'boards', '좋아요순 필터'),

-- 페이징
('boards.pagination.first', '처음', 'First', '最初', '首页', 'boards', '처음 페이지'),
('boards.pagination.prev', '이전', 'Previous', '前', '上一页', 'boards', '이전 페이지'),
('boards.pagination.next', '다음', 'Next', '次', '下一页', 'boards', '다음 페이지'),
('boards.pagination.last', '마지막', 'Last', '最後', '末页', 'boards', '마지막 페이지'),
('boards.pagination.page', '페이지', 'Page', 'ページ', '页', 'boards', '페이지'),
('boards.pagination.of', '/', 'of', '/', '/', 'boards', '페이지 구분자'),

-- 에러 메시지
('boards.error.title_required', '제목을 입력해주세요.', 'Title is required.', 'タイトルを入力してください。', '请输入标题。', 'boards', '제목 필수 에러'),
('boards.error.content_required', '내용을 입력해주세요.', 'Content is required.', '内容を入力してください。', '请输入内容。', 'boards', '내용 필수 에러'),
('boards.error.file_too_large', '파일 크기가 너무 큽니다.', 'File size is too large.', 'ファイルサイズが大きすぎます。', '文件大小过大。', 'boards', '파일 크기 에러'),
('boards.error.invalid_file_type', '허용되지 않는 파일 형식입니다.', 'Invalid file type.', '許可されていないファイル形式です。', '不允许的文件格式。', 'boards', '파일 형식 에러'),
('boards.error.post_not_found', '게시글을 찾을 수 없습니다.', 'Post not found.', '投稿が見つかりません。', '找不到帖子。', 'boards', '게시글 없음 에러'),
('boards.error.permission_denied', '권한이 없습니다.', 'Permission denied.', '権限がありません。', '没有权限。', 'boards', '권한 없음 에러'),
('boards.error.server_error', '서버 오류가 발생했습니다.', 'Server error occurred.', 'サーバーエラーが発生しました。', '服务器错误。', 'boards', '서버 에러'),

-- 관리자 전용
('boards.admin.manage', '게시판 관리', 'Board Management', '掲示板管理', '公告板管理', 'boards', '게시판 관리'),
('boards.admin.create_board', '게시판 생성', 'Create Board', '掲示板作成', '创建公告板', 'boards', '게시판 생성'),
('boards.admin.edit_board', '게시판 수정', 'Edit Board', '掲示板編集', '编辑公告板', 'boards', '게시판 수정'),
('boards.admin.board_settings', '게시판 설정', 'Board Settings', '掲示板設定', '公告板设置', 'boards', '게시판 설정'),
('boards.admin.moderate', '게시글 관리', 'Moderate Posts', '投稿管理', '管理帖子', 'boards', '게시글 관리'),
('boards.admin.statistics', '통계', 'Statistics', '統計', '统计', 'boards', '통계')

ON CONFLICT (key) DO UPDATE SET
    ko = EXCLUDED.ko,
    en = EXCLUDED.en,
    ja = EXCLUDED.ja,
    zh = EXCLUDED.zh,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    updated_at = NOW();

COMMIT;