import { EXCUSES } from './excuses.js';
import { supabase } from './supabase-client.js';

let lastExcuse = "";
let currentOffset = 20;
export let isLoading = false;
export let hasMore = true;

export function getTakashiReply(userComment) {
// ... (既存維持)
  const isAngry = userComment.includes("バカ") || userComment.includes("言い訳") || userComment.includes("外れた");

  let apology = "申し訳ありません。";
  if (isAngry) {
      apology = "おっしゃる通りです。完全に私の責任です。";
  }

  let excuse = getExcuse();

  return `${apology} ……ただ、${excuse}。`;
}

function getExcuse() {
  let excuse;
  do {
      const index = Math.floor(Math.random() * EXCUSES.length);
      excuse = EXCUSES[index];
  } while (excuse === lastExcuse);

  lastExcuse = excuse;
  return excuse;
}

function formatDate(isoString) {
    if (!isoString) return '日時不明';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '日時不明';
    return new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
    }).format(date);
}

export async function saveComment(name, comment, reply) {
    const { data, error } = await supabase
        .from('comments')
        .insert([{
            user_name: name,
            user_comment: comment,
            ai_reply: reply,
            qr_code: null
        }])
        .select();

    if (error) {
        console.error('保存失敗:', error);
        throw error;
    }
    return data;
}

export async function loadComments(isMore = false) {
    if (isLoading || (!isMore && !hasMore && currentOffset > 0)) return;

    isLoading = true;
    const history = document.getElementById('comment-history');

    // インジケーター表示
    let loadingEl = document.getElementById('loading-indicator');
    if (!loadingEl) {
        loadingEl = document.createElement('div');
        loadingEl.id = 'loading-indicator';
        loadingEl.textContent = '読み込み中...';
    }
    history.appendChild(loadingEl);

    let query = supabase.from('comments').select('*').order('created_at', { ascending: false });

    if (isMore) {
        query = query.range(currentOffset, currentOffset + 19);
    } else {
        query = query.limit(20);
        history.innerHTML = '';
        currentOffset = 0;
        hasMore = true;
    }

    const { data, error } = await query;

    // インジケーター削除
    if (loadingEl && loadingEl.parentNode) loadingEl.parentNode.removeChild(loadingEl);

    if (error) {
        console.error('読み込み失敗:', error);
        isLoading = false;
        return;
    }

    if (data.length < 20) {
        hasMore = false;
        if (!document.getElementById('no-more-comments')) {
            const noMore = document.createElement('div');
            noMore.id = 'no-more-comments';
            noMore.textContent = 'これ以上コメントはありません';
            history.appendChild(noMore);
        }
    }

    // 既存の古いものが下に来るように、配列を反転して追加
    if (isMore) {
        // 追加読み込み：最新から古い順に末尾に追加
        data.forEach(comment => {
            addCommentToUI(comment.user_name, comment.user_comment, comment.ai_reply, comment.created_at, false);
        });
    } else {
        // 初回読み込み：古い順から先頭に追加（結果として最新が一番上）
        data.slice().reverse().forEach(comment => {
            addCommentToUI(comment.user_name, comment.user_comment, comment.ai_reply, comment.created_at, true);
        });
    }

    currentOffset += data.length;
    isLoading = false;
}

export function addCommentToUI(name, comment, reply, createdAt = new Date().toISOString(), isPrepend = true) {
    const history = document.getElementById('comment-history');

    const div = document.createElement('div');
    div.className = 'comment-item';

    div.innerHTML = `
        <div class="comment-date">${formatDate(createdAt)}</div>
        <div class="comment-user"><b>${escapeHtml(name)}</b>：${escapeHtml(comment)}</div>
        <div class="takashi-reply"><b>AIタカシ</b>：${escapeHtml(reply)}</div>
    `;

    if (isPrepend) {
        history.insertBefore(div, history.firstChild);
    } else {
        history.appendChild(div);
    }
}
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, (m) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
}
